import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, razorpayPublicKeyId } from "@/lib/razorpay";
import { toMinorUnits } from "@/lib/format";
import { calculateDiscount, checkoutSchema, couponIsUsable, createOrderNumber } from "@/lib/backend";
import { getCurrentUser } from "@/lib/auth";
import { createAccessToken, recordOrderEvent } from "@/lib/orders/events";
import {
  getServerPaymentProviderId,
  isActiveProviderConfigured,
  unconfiguredProviderMessage,
} from "@/lib/payment/server";

/** A checkout failure the shopper can act on (an item sold out or was
 * withdrawn). Its message is written to be shown as-is; every other error
 * stays generic so implementation details never reach the browser. */
class CheckoutError extends Error {}

export async function POST(request: Request) {
  // Whichever gateway is active must have its secrets before we touch the
  // database, so checkout degrades to the same honest "not connected yet"
  // response rather than leaving a pending order nothing can pay for.
  if (!isActiveProviderConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: unconfiguredProviderMessage() },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Malformed request body." },
      { status: 400 },
    );
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "Invalid checkout request.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const { lines, couponCode, shipping, source } = parsed.data;
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

    let coupon = null;
    let discount = 0;
    let couponReserved = false;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && couponIsUsable(coupon, subtotal)) {
        discount = calculateDiscount(coupon, subtotal);

        // For limited-use coupons, reserve one use before creating the
        // Razorpay order. The conditional update prevents two concurrent checkouts
        // from both claiming the same final use.
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
            return NextResponse.json(
              {
                error: "coupon_unavailable",
                message: "That coupon is no longer available. Please try again.",
              },
              { status: 409 },
            );
          }

          couponReserved = true;
        }
      } else {
        coupon = null;
      }
    }

    const provider = getServerPaymentProviderId();

    // Shipping and tax are not configured anywhere on the site yet (see
    // src/data/shipping.ts and src/data/tax.ts) — kept at 0 here rather than
    // invented, consistent with the rest of the checkout flow.
    const shippingCost = 0;
    const tax = 0;
    const currency = (process.env.STORE_CURRENCY || "INR").toUpperCase();
    const total = Math.max(0, subtotal - discount + shippingCost + tax);

    let order;
    try {
      order = await prisma.order.create({
        data: {
          orderNumber: createOrderNumber(),
          email: shipping.email,
          customerName: shipping.name,
          phone: shipping.phone,
          // Guest checkout leaves this null; a signed-in shopper gets the
          // order linked so it appears in their /account order history.
          userId: currentUser?.id ?? null,
          source,
          paymentStatus: "PENDING",
          paymentProvider: provider,
          // Unguessable token so a guest can track this order without an
          // account, and without the order number alone granting access.
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

    try {
      // Razorpay Checkout is a browser modal, not a redirect, so we hand the
      // client the gateway order id plus the PUBLIC key id only. The key
      // secret never leaves the server, and the browser's eventual success
      // claim is worthless until /api/payments/razorpay/verify checks its
      // HMAC signature.
      const rzpOrder = await createRazorpayOrder({
        amount: total,
        currency,
        receipt: order.orderNumber,
        notes: { orderId: order.id, orderNumber: order.orderNumber },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: rzpOrder.id },
      });

      const keyId = razorpayPublicKeyId();
      if (!keyId) throw new Error("RAZORPAY_KEY_ID is not set.");

      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        accessToken: order.accessToken,
        razorpay: {
          keyId,
          orderId: rzpOrder.id,
          amount: rzpOrder.amount ?? toMinorUnits(total),
          currency: rzpOrder.currency ?? currency,
        },
      });
    } catch (error) {
      // Gateway order creation failed. Remove the unusable pending order and
      // release any limited coupon reservation.
      await prisma.$transaction(async (tx) => {
        await tx.order.deleteMany({
          where: { id: order.id, paymentStatus: "PENDING" },
        });

        if (couponReserved && coupon) {
          await tx.coupon.updateMany({
            where: { id: coupon.id, timesUsed: { gt: 0 } },
            data: { timesUsed: { decrement: 1 } },
          });
        }
      });

      throw error;
    }
  } catch (error) {
    console.error("checkout_failed", error);

    // Availability problems are the shopper's to resolve, so their (already
    // sanitized) message is returned; otherwise a retry tells them nothing.
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: "line_unavailable", message: error.message },
        { status: 409 },
      );
    }

    // Keep implementation/database/gateway details out of the browser response.
    return NextResponse.json(
      {
        error: "checkout_failed",
        message: "Unable to start checkout right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
