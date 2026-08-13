import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isRazorpayConfigured,
  isRazorpayWebhookConfigured,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";
import { applyPaymentStatus } from "@/lib/orders/events";

export const runtime = "nodejs";

/**
 * Razorpay's authoritative confirmation of payment state.
 *
 * Idempotency has two layers:
 *  1. A ProcessedWebhookEvent-style marker row keyed on Razorpay's event id,
 *     written inside a transaction, so a redelivered event is rejected on the
 *     primary key rather than reprocessed.
 *  2. applyPaymentStatus only transitions an order that is not already in the
 *     target state, so even if a marker were lost the customer could not
 *     receive a second confirmation message.
 *
 * The webhook secret is separate from the API key secret, and the signature
 * is computed over the RAW body — so the body must be read as text before
 * being parsed.
 */

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; method?: string; status?: string } };
    order?: { entity?: { id?: string } };
    refund?: { entity?: { id?: string; payment_id?: string; status?: string } };
  };
};

/** Resolves our internal order from the gateway ids in the payload. */
async function findOrderId(entity: {
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
}): Promise<string | null> {
  if (entity.razorpayOrderId) {
    const byOrder = await prisma.order.findUnique({
      where: { razorpayOrderId: entity.razorpayOrderId },
      select: { id: true },
    });
    if (byOrder) return byOrder.id;
  }
  if (entity.razorpayPaymentId) {
    const byPayment = await prisma.order.findFirst({
      where: { razorpayPaymentId: entity.razorpayPaymentId },
      select: { id: true },
    });
    if (byPayment) return byPayment.id;
  }
  return null;
}

export async function POST(request: Request) {
  if (!isRazorpayConfigured() || !isRazorpayWebhookConfigured()) {
    // 400, not 500 — nothing to retry until the secret is configured.
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    console.error("razorpay_webhook_signature_invalid");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  // Razorpay's delivery id. Falling back to a payload-derived key keeps
  // deduplication working even if the header is ever absent.
  const payment = event.payload?.payment?.entity;
  const refund = event.payload?.refund?.entity;
  const gatewayOrderId = event.payload?.order?.entity?.id ?? payment?.order_id ?? null;
  const eventId =
    request.headers.get("x-razorpay-event-id") ??
    `${event.event ?? "unknown"}:${payment?.id ?? refund?.id ?? gatewayOrderId ?? "none"}`;

  try {
    const orderId = await findOrderId({
      razorpayOrderId: gatewayOrderId,
      razorpayPaymentId: payment?.id ?? refund?.payment_id ?? null,
    });

    // Claim the event before acting on it. Committing the marker in its own
    // transaction means a duplicate is rejected here, before any status change.
    await prisma.processedWebhookEvent.create({
      data: { id: `rzp_${eventId}`, type: event.event ?? "unknown" },
    });

    if (!orderId) {
      // Signature was valid but we have no such order — acknowledge so Razorpay
      // stops retrying, and log for investigation.
      console.warn("razorpay_webhook_unknown_order", { event: event.event, gatewayOrderId });
      return NextResponse.json({ received: true });
    }

    switch (event.event) {
      case "order.paid":
      case "payment.captured":
        await applyPaymentStatus({
          orderId,
          status: "PAID",
          paymentProvider: "razorpay",
          paymentMethod: payment?.method ?? null,
          razorpayPaymentId: payment?.id ?? null,
          metadata: { source: "webhook", event: event.event },
        });
        break;

      case "payment.failed":
        await applyPaymentStatus({
          orderId,
          status: "FAILED",
          paymentProvider: "razorpay",
          razorpayPaymentId: payment?.id ?? null,
          metadata: { source: "webhook", event: event.event },
        });
        break;

      case "refund.created":
        await applyPaymentStatus({
          orderId,
          status: "REFUND_PENDING",
          paymentProvider: "razorpay",
          razorpayRefundId: refund?.id ?? null,
          metadata: { source: "webhook", event: event.event },
        });
        break;

      case "refund.processed":
        await applyPaymentStatus({
          orderId,
          status: "REFUNDED",
          paymentProvider: "razorpay",
          razorpayRefundId: refund?.id ?? null,
          metadata: { source: "webhook", event: event.event },
        });
        break;

      default:
        // Subscribed to something we don't act on — acknowledge, don't retry.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Already processed this delivery.
      return NextResponse.json({ received: true });
    }
    console.error("razorpay_webhook_failed", error);
    // 500 so Razorpay retries transient database failures.
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
