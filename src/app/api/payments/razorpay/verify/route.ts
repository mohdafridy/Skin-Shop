import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  fetchRazorpayPayment,
  isRazorpayConfigured,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";
import { applyPaymentStatus } from "@/lib/orders/events";
import { toMinorUnits } from "@/lib/format";

export const runtime = "nodejs";

const schema = z.object({
  orderId: z.string().trim().min(1).max(64),
  razorpayOrderId: z.string().trim().min(1).max(64),
  razorpayPaymentId: z.string().trim().min(1).max(64),
  signature: z.string().trim().min(1).max(256),
});

/**
 * Confirms a payment the browser says succeeded.
 *
 * The browser's word is never enough: the HMAC signature is checked against
 * our key secret, and the razorpay_order_id must match the one we stored on
 * this order at checkout — so a signature captured from someone else's
 * payment cannot be replayed onto a different order.
 *
 * The webhook is still the authoritative confirmation. This route exists so
 * the customer sees a real confirmation immediately instead of waiting on
 * webhook delivery; both paths funnel through applyPaymentStatus, which only
 * transitions (and only notifies) once.
 */
export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "Payments are not connected yet." },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid payment confirmation." },
      { status: 400 },
    );
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, signature } = parsed.data;

  if (!verifyRazorpayPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature })) {
    console.error("razorpay_signature_mismatch", { orderId, razorpayOrderId });
    return NextResponse.json(
      {
        error: "signature_mismatch",
        message:
          "We couldn't verify that payment. If you were charged, it will be confirmed shortly — please don't pay again.",
      },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        razorpayOrderId: true,
        accessToken: true,
        paymentStatus: true,
        total: true,
        currency: true,
      },
    });

    // Binding the signature to the order we actually created blocks replaying
    // a genuine signature against a different order.
    if (!order || order.razorpayOrderId !== razorpayOrderId) {
      console.error("razorpay_order_mismatch", { orderId, razorpayOrderId });
      return NextResponse.json(
        { error: "order_mismatch", message: "That payment doesn't match this order." },
        { status: 400 },
      );
    }

    // Signature proves authenticity; ask Razorpay what actually happened to
    // the money before recording a success.
    const payment = await fetchRazorpayPayment(razorpayPaymentId);
    const captured = payment.status === "captured" || payment.status === "authorized";

    if (!captured) {
      await applyPaymentStatus({
        orderId: order.id,
        status: "FAILED",
        paymentProvider: "razorpay",
        razorpayPaymentId,
        metadata: { source: "verify", razorpayStatus: payment.status },
      });
      return NextResponse.json(
        { verified: false, message: "That payment didn't complete. Nothing has been charged." },
        { status: 402 },
      );
    }

    // Belt-and-suspenders: the Razorpay Order was already created server-side
    // with the exact amount, so Checkout.js cannot itself substitute a
    // different one — but confirming what the gateway actually captured
    // matches what we billed costs nothing and catches any future gap in
    // that assumption.
    if (payment.amount !== toMinorUnits(order.total) || payment.currency !== order.currency) {
      console.error("razorpay_amount_mismatch", {
        orderId: order.id,
        expectedAmount: toMinorUnits(order.total),
        actualAmount: payment.amount,
        expectedCurrency: order.currency,
        actualCurrency: payment.currency,
      });
      return NextResponse.json(
        {
          error: "amount_mismatch",
          message:
            "We couldn't verify that payment. If you were charged, please contact us with your order number.",
        },
        { status: 400 },
      );
    }

    await applyPaymentStatus({
      orderId: order.id,
      status: "PAID",
      paymentProvider: "razorpay",
      paymentMethod: payment.method ?? null,
      razorpayPaymentId,
      metadata: { source: "verify", razorpayStatus: payment.status },
    });

    return NextResponse.json({
      verified: true,
      redirectUrl: `/order-success?order=${order.accessToken}`,
    });
  } catch (error) {
    console.error("razorpay_verify_failed", error);
    return NextResponse.json(
      {
        error: "verify_failed",
        message:
          "We couldn't confirm your payment right now. If you were charged it will be confirmed shortly — please don't pay again.",
      },
      { status: 500 },
    );
  }
}
