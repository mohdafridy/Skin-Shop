import { NextResponse } from "next/server";
import { Prisma, type Order, type OrderItem, type OrderEventType } from "@prisma/client";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notifyOrderEvent } from "@/lib/notifications";
import { recordOrderEvent } from "@/lib/orders/events";

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
): Promise<boolean> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return false;

  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.paymentStatus === "PAID") return false;

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
      paymentStatus: "PAID",
      paymentProvider: "stripe",
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

  return true;
}

async function markPaymentFailed(
  tx: Prisma.TransactionClient,
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return false;

  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.paymentStatus !== "PENDING") return false;

  await tx.order.update({
    where: { id: order.id },
    data: { paymentStatus: "FAILED" },
  });

  await releaseLimitedCoupon(tx, order);
  return true;
}

async function expireCheckout(
  tx: Prisma.TransactionClient,
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return false;

  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.paymentStatus !== "PENDING") return false;

  await tx.order.update({
    where: { id: order.id },
    data: { fulfilmentStatus: "CANCELLED", cancelledAt: new Date() },
  });

  await releaseLimitedCoupon(tx, order);
  return true;
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

  // Set inside the transaction, dispatched only after it commits: a
  // notification must never be sent for a transition that later rolled back,
  // and a messaging outage must never roll back a confirmed payment.
  let pending: { orderId: string; event: OrderEventType } | null = null;

  try {
    await prisma.$transaction(
      async (tx) => {
        pending = null;
        // Insert the event marker inside the same transaction as fulfillment.
        // The unique primary key makes retries idempotent; if processing fails,
        // the marker rolls back too and Stripe can safely retry.
        await tx.processedWebhookEvent.create({
          data: { id: event.id, type: event.type },
        });

        if (
          event.type === "checkout.session.completed" ||
          event.type === "checkout.session.async_payment_succeeded"
        ) {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.payment_status === "paid" && (await fulfill(tx, session))) {
            pending = { orderId: session.metadata!.orderId!, event: "PAYMENT_SUCCESSFUL" };
          }
        } else if (event.type === "checkout.session.async_payment_failed") {
          const session = event.data.object as Stripe.Checkout.Session;
          if (await markPaymentFailed(tx, session)) {
            pending = { orderId: session.metadata!.orderId!, event: "PAYMENT_FAILED" };
          }
        } else if (event.type === "checkout.session.expired") {
          const session = event.data.object as Stripe.Checkout.Session;
          if (await expireCheckout(tx, session)) {
            pending = { orderId: session.metadata!.orderId!, event: "CANCELLED" };
          }
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    // Committed. Record history and notify; notifyOrderEvent never throws and
    // deduplicates per (order, event, channel) on its own.
    const settled = pending as { orderId: string; event: OrderEventType } | null;
    if (settled) {
      await recordOrderEvent(settled.orderId, settled.event, { source: "stripe_webhook" });
      await notifyOrderEvent(settled.orderId, settled.event);
    }

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
