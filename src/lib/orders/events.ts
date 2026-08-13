import type {
  FulfilmentStatus,
  OrderEventType,
  Prisma,
  PaymentStatus,
} from "@prisma/client";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { notifyOrderEvent } from "@/lib/notifications";

/**
 * The one place order status changes are written and history is recorded.
 * Routes call these instead of updating Order directly, so an event row and a
 * notification attempt can never be forgotten for a transition.
 */

/** Unguessable token for guest order tracking. 32 bytes of entropy — an
 * order number must never be sufficient to view someone's order. */
export function createAccessToken(): string {
  return randomBytes(32).toString("hex");
}

export async function recordOrderEvent(
  orderId: string,
  type: OrderEventType,
  metadata?: Prisma.InputJsonValue,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx ?? prisma;
  await client.orderEvent.create({
    data: { orderId, type, ...(metadata !== undefined ? { metadata } : {}) },
  });
}

/** Fulfilment status -> the event it emits. PACKED and PROCESSING are
 * internal, so they record history without messaging the customer (see
 * isNotifiableEvent). */
const fulfilmentEvent: Record<FulfilmentStatus, OrderEventType | null> = {
  UNFULFILLED: null,
  PROCESSING: "PROCESSING",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

/** SHIPPED without courier details leaves the customer with a shipped
 * notification they can't act on — enforced identically by the raw API
 * (src/app/api/admin/orders/[id]/route.ts) and the /admin dashboard. */
export function fulfilmentRequiresCourier(status: FulfilmentStatus): boolean {
  return status === "SHIPPED";
}

const paymentEvent: Record<PaymentStatus, OrderEventType | null> = {
  PENDING: "PAYMENT_PENDING",
  PAID: "PAYMENT_SUCCESSFUL",
  FAILED: "PAYMENT_FAILED",
  REFUND_PENDING: "REFUND_INITIATED",
  REFUNDED: "REFUNDED",
};

/**
 * Moves payment status forward, records history, and notifies the customer.
 *
 * Returns false when the order was already in the target state, which is how
 * a redelivered gateway webhook becomes a no-op: the conditional updateMany
 * only matches while the order is still in a different state, so exactly one
 * caller wins and only that caller notifies.
 */
export async function applyPaymentStatus(input: {
  orderId: string;
  status: PaymentStatus;
  paymentProvider?: string;
  paymentMethod?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpayRefundId?: string | null;
  email?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<boolean> {
  const now = new Date();
  const data: Prisma.OrderUpdateManyMutationInput = { paymentStatus: input.status };

  if (input.paymentProvider) data.paymentProvider = input.paymentProvider;
  if (input.paymentMethod) data.paymentMethod = input.paymentMethod;
  if (input.razorpayOrderId) data.razorpayOrderId = input.razorpayOrderId;
  if (input.razorpayPaymentId) data.razorpayPaymentId = input.razorpayPaymentId;
  if (input.razorpayRefundId) data.razorpayRefundId = input.razorpayRefundId;
  if (input.email) data.email = input.email;
  if (input.status === "PAID") data.paidAt = now;
  if (input.status === "REFUNDED") data.refundedAt = now;

  // Only transition if we are not already there — this is the idempotency
  // guard for duplicate webhook deliveries.
  const updated = await prisma.order.updateMany({
    where: { id: input.orderId, paymentStatus: { not: input.status } },
    data,
  });
  if (updated.count !== 1) return false;

  const event = paymentEvent[input.status];
  if (event) {
    await recordOrderEvent(input.orderId, event, input.metadata);
    // Deliberately after the status commit: notification failure must never
    // roll back a confirmed payment.
    await notifyOrderEvent(input.orderId, event);
  }
  return true;
}

/**
 * Moves fulfilment status forward (store owner action), stores manual
 * shipment details, records history, and notifies the customer.
 */
export async function applyFulfilmentStatus(input: {
  orderId: string;
  status: FulfilmentStatus;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  notes?: string | null;
}): Promise<boolean> {
  const now = new Date();
  const data: Prisma.OrderUpdateManyMutationInput = { fulfilmentStatus: input.status };

  if (input.courierName !== undefined) data.courierName = input.courierName;
  if (input.trackingNumber !== undefined) data.trackingNumber = input.trackingNumber;
  if (input.trackingUrl !== undefined) data.trackingUrl = input.trackingUrl;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.status === "SHIPPED") data.shippedAt = now;
  if (input.status === "DELIVERED") data.deliveredAt = now;
  if (input.status === "CANCELLED") data.cancelledAt = now;

  const updated = await prisma.order.updateMany({
    where: { id: input.orderId, fulfilmentStatus: { not: input.status } },
    data,
  });
  if (updated.count !== 1) return false;

  const event = fulfilmentEvent[input.status];
  if (event) {
    await recordOrderEvent(input.orderId, event, {
      courierName: input.courierName ?? null,
      trackingNumber: input.trackingNumber ?? null,
    });
    await notifyOrderEvent(input.orderId, event);
  }
  return true;
}
