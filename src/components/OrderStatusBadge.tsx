import type { FulfilmentStatus, PaymentStatus } from "@prisma/client";

/**
 * Customer-facing status pills, in the site's existing palette. Shared by
 * /order-success, /account and /track so the same state never reads
 * differently in two places.
 */

type Tone = "positive" | "pending" | "problem" | "neutral";

const toneClass: Record<Tone, string> = {
  positive: "bg-olive/15 text-olive",
  pending: "bg-gold/20 text-walnut",
  problem: "bg-burgundy/10 text-burgundy",
  neutral: "bg-sand text-walnut/80",
};

const paymentLabels: Record<PaymentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Payment pending", tone: "pending" },
  PAID: { label: "Paid", tone: "positive" },
  FAILED: { label: "Payment failed", tone: "problem" },
  REFUND_PENDING: { label: "Refund pending", tone: "pending" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

const fulfilmentLabels: Record<FulfilmentStatus, { label: string; tone: Tone }> = {
  UNFULFILLED: { label: "Preparing your order", tone: "neutral" },
  PROCESSING: { label: "Processing", tone: "neutral" },
  PACKED: { label: "Packed", tone: "neutral" },
  SHIPPED: { label: "Shipped", tone: "positive" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", tone: "positive" },
  DELIVERED: { label: "Delivered", tone: "positive" },
  CANCELLED: { label: "Cancelled", tone: "problem" },
};

function Pill({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${toneClass[tone]}`}
    >
      {label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, tone } = paymentLabels[status];
  return <Pill label={label} tone={tone} />;
}

/** Fulfilment is only meaningful once payment succeeded — showing "Preparing
 * your order" next to a failed payment would be misleading. */
export function FulfilmentStatusBadge({
  status,
  paymentStatus,
}: {
  status: FulfilmentStatus;
  paymentStatus: PaymentStatus;
}) {
  if (paymentStatus !== "PAID" && status === "UNFULFILLED") return null;
  const { label, tone } = fulfilmentLabels[status];
  return <Pill label={label} tone={tone} />;
}

export { paymentLabels, fulfilmentLabels };
