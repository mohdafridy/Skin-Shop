import { NextResponse } from "next/server";
import { Prisma, type Order, type OrderItem } from "@prisma/client";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type OrderWithItems = Order & { items: OrderItem[] };

async function releaseLimitedCoupon(
  tx: Prisma.TransactionClient,
  order: OrderWithItems,
) {
  if (!order.couponId) return;

  const coupon = await tx.coupon.findUnique({
    where: { id: order.couponId },
    select: { usageLimit: true },
  });

  if (coupon?.usageLimit !== null && coupon?.usageLimit !== undefined) {
    await tx.coupon.updateMany({
      where: { id: order.couponId, timesUsed: { gt: 0 } },
      data: { timesUsed: { decrement: 1 } },
    });
  }
}

async function fulfill(
  tx: Prisma.TransactionClient,
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.status === "PAID") return;

  for (const item of order.items) {
    if (item.type === "PRODUCT" && item.productId) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (product && product.stock !== null) {
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    } else if (item.type === "COMBO" && item.comboId) {
      const combo = await tx.combo.findUnique({
        where: { id: item.comboId },
      });

      if (combo && combo.stock !== null) {
        if (combo.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }

        await tx.combo.update({
          where: { id: item.comboId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }
  }

  await tx.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      email: session.customer_details?.email || order.email,
      stripePaymentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
    },
  });

  // Limited coupons were reserved during checkout. Unlimited coupons still
  // increment here so timesUsed remains useful as an analytics counter.
  if (order.couponId) {
    const coupon = await tx.coupon.findUnique({
      where: { id: order.couponId },
      select: { usageLimit: true },
    });

    if (coupon?.usageLimit === null) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { timesUsed: { increment: 1 } },
      });
    }
  }
}

async function markPaymentFailed(
  tx: Prisma.TransactionClient,
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.status !== "PENDING") return;

  await tx.order.update({
    where: { id: order.id },
    data: { status: "PAYMENT_FAILED" },
  });

  await releaseLimitedCoupon(tx, order);
}

async function expireCheckout(
  tx: Prisma.TransactionClient,
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.status !== "PENDING") return;

  await tx.order.update({
    where: { id: order.id },
    data: { status: "CANCELLED" },
  });

  await releaseLimitedCoupon(tx, order);
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 400 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 400 },
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        // Insert the event marker inside the same transaction as fulfillment.
        // The unique primary key makes retries idempotent; if processing fails,
        // the marker rolls back too and Stripe can safely retry.
        await tx.processedStripeEvent.create({
          data: { id: event.id, type: event.type },
        });

        if (
          event.type === "checkout.session.completed" ||
          event.type === "checkout.session.async_payment_succeeded"
        ) {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.payment_status === "paid") {
            await fulfill(tx, session);
          }
        } else if (event.type === "checkout.session.async_payment_failed") {
          await markPaymentFailed(
            tx,
            event.data.object as Stripe.Checkout.Session,
          );
        } else if (event.type === "checkout.session.expired") {
          await expireCheckout(
            tx,
            event.data.object as Stripe.Checkout.Session,
          );
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    // A duplicate Stripe event is already fully processed.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ received: true });
    }

    console.error("stripe_webhook_failed", error);

    // Return 500 so Stripe retries transient serialization/database failures.
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
