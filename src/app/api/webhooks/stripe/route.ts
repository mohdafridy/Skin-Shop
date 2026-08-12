import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function fulfill(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.status === "PAID") return;

    for (const item of order.items) {
      if (item.type === "PRODUCT" && item.productId) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product && product.stock !== null) {
          if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${item.name}`);
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
      } else if (item.type === "COMBO" && item.comboId) {
        const combo = await tx.combo.findUnique({ where: { id: item.comboId } });
        if (combo && combo.stock !== null) {
          if (combo.stock < item.quantity) throw new Error(`Insufficient stock for ${item.name}`);
          await tx.combo.update({ where: { id: item.comboId }, data: { stock: { decrement: item.quantity } } });
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
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      },
    });
    if (order.couponId) await tx.coupon.update({ where: { id: order.couponId }, data: { timesUsed: { increment: 1 } } });
  });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (await prisma.processedStripeEvent.findUnique({ where: { id: event.id } })) {
    return NextResponse.json({ received: true });
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") await fulfill(session);
    }
    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.orderId) {
        await prisma.order.updateMany({
          where: { id: session.metadata.orderId, status: "PENDING" },
          data: { status: "PAYMENT_FAILED" },
        });
      }
    }
    await prisma.processedStripeEvent.create({ data: { id: event.id, type: event.type } });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
