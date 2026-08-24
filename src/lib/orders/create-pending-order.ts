import type { Coupon, Order } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateDiscount, couponIsUsable, createOrderNumber } from "@/lib/backend";
import type { checkoutSchema } from "@/lib/backend";
import { calculateShippingCost } from "@/data/shipping";
import { getCurrentUser } from "@/lib/auth";
import { createAccessToken, recordOrderEvent } from "@/lib/orders/events";

/** A checkout failure the shopper can act on (an item sold out or was
 * withdrawn). Its message is written to be shown as-is. */
export class CheckoutError extends Error {}

/** A limited-use coupon's final use was claimed by a concurrent checkout
 * between validation and reservation. */
export class CouponUnavailableError extends Error {}

type CheckoutData = z.infer<typeof checkoutSchema>;

export type PendingOrder = {
  order: Order;
  coupon: Coupon | null;
  /** True when a limited-use coupon's count was incremented for this order —
   * the caller must release it if a later step (e.g. gateway order creation)
   * fails and the pending order is discarded. */
  couponReserved: boolean;
  discount: number;
  total: number;
  currency: string;
};

/**
 * Validate a cart against live product/combo data, price it, reserve any
 * limited-use coupon, and create the order as PENDING with its ORDER_CREATED
 * event. Shared by every payment path (Razorpay and direct UPI) so stock
 * checks, pricing, shipping and coupon reservation can never drift between
 * them. The order exists as PENDING on return; the caller attaches whatever
 * the chosen payment method needs and is responsible for confirming payment.
 */
export async function createPendingOrder(
  data: CheckoutData,
  { provider }: { provider: string },
): Promise<PendingOrder> {
  const { lines, couponCode, shipping, source } = data;
  // Optional — guest checkout is the default and stays fully supported.
  const currentUser = await getCurrentUser();

  const productSlugs = lines.filter((line) => line.type === "product").map((line) => line.slug);
  const comboSlugs = lines.filter((line) => line.type === "combo").map((line) => line.slug);

  const [products, combos] = await Promise.all([
    productSlugs.length
      ? prisma.product.findMany({ where: { slug: { in: productSlugs }, active: true } })
      : Promise.resolve([]),
    comboSlugs.length
      ? prisma.combo.findMany({ where: { slug: { in: comboSlugs }, active: true } })
      : Promise.resolve([]),
  ]);

  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const comboBySlug = new Map(combos.map((combo) => [combo.slug, combo]));

  let subtotal = 0;
  const orderItems = lines.map((line) => {
    if (line.type === "product") {
      const product = productBySlug.get(line.slug);
      if (!product) {
        throw new CheckoutError("A product in your cart is no longer available.");
      }
      if (product.stock !== null && line.quantity > product.stock) {
        throw new CheckoutError("A product in your cart no longer has enough stock.");
      }

      const lineTotal = product.price * line.quantity;
      subtotal += lineTotal;

      return {
        type: "PRODUCT" as const,
        slug: product.slug,
        productId: product.id,
        name: product.name,
        image: product.image,
        unitPrice: product.price,
        quantity: line.quantity,
        lineTotal,
      };
    }

    const combo = comboBySlug.get(line.slug);
    if (!combo) {
      throw new CheckoutError("A combo in your cart is no longer available.");
    }
    if (combo.stock !== null && line.quantity > combo.stock) {
      throw new CheckoutError("A combo in your cart no longer has enough stock.");
    }

    const lineTotal = combo.price * line.quantity;
    subtotal += lineTotal;

    return {
      type: "COMBO" as const,
      slug: combo.slug,
      comboId: combo.id,
      name: combo.name,
      image: combo.image,
      unitPrice: combo.price,
      quantity: line.quantity,
      lineTotal,
    };
  });

  let coupon: Coupon | null = null;
  let discount = 0;
  let couponReserved = false;

  if (couponCode) {
    coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    });

    if (coupon && couponIsUsable(coupon, subtotal)) {
      discount = calculateDiscount(coupon, subtotal);

      // For limited-use coupons, reserve one use before the order is created.
      // The conditional update prevents two concurrent checkouts from both
      // claiming the same final use.
      if (coupon.usageLimit !== null) {
        const reservation = await prisma.coupon.updateMany({
          where: {
            id: coupon.id,
            active: true,
            timesUsed: { lt: coupon.usageLimit },
          },
          data: { timesUsed: { increment: 1 } },
        });

        if (reservation.count !== 1) {
          throw new CouponUnavailableError(
            "That coupon is no longer available. Please try again.",
          );
        }

        couponReserved = true;
      }
    } else {
      coupon = null;
    }
  }

  // Never trust a client-supplied shipping number — recompute from the order's
  // own city and item composition. Tax has no rate supplied yet (see
  // src/data/tax.ts), so it stays at 0 rather than inventing one.
  const shippingCost = calculateShippingCost({
    city: shipping.city,
    hasFreeShippingItem: orderItems.some((item) => item.type === "COMBO"),
  });
  const tax = 0;
  const currency = (process.env.STORE_CURRENCY || "INR").toUpperCase();
  const total = Math.max(0, subtotal - discount + shippingCost + tax);

  let order: Order;
  try {
    order = await prisma.order.create({
      data: {
        orderNumber: createOrderNumber(),
        email: shipping.email,
        customerName: shipping.name,
        phone: shipping.phone,
        userId: currentUser?.id ?? null,
        source,
        paymentStatus: "PENDING",
        paymentProvider: provider,
        accessToken: createAccessToken(),
        subtotal,
        discount,
        shipping: shippingCost,
        tax,
        total,
        currency,
        couponId: coupon?.id,
        shippingName: shipping.name,
        shippingLine1: shipping.address1,
        shippingLine2: shipping.address2 || null,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPostal: shipping.postalCode,
        shippingCountry: shipping.country,
        items: { create: orderItems },
      },
    });
  } catch (error) {
    if (couponReserved && coupon) {
      await prisma.coupon.updateMany({
        where: { id: coupon.id, timesUsed: { gt: 0 } },
        data: { timesUsed: { decrement: 1 } },
      });
    }
    throw error;
  }

  // Order exists as PENDING from here on; the history trail starts now.
  await recordOrderEvent(order.id, "ORDER_CREATED", {
    provider,
    total,
    currency,
    lineCount: orderItems.length,
  });

  return { order, coupon, couponReserved, discount, total, currency };
}
