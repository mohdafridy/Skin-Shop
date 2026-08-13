"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isRazorpayConfigured, refundPayment } from "@/lib/razorpay";
import { applyFulfilmentStatus, applyPaymentStatus, fulfilmentRequiresCourier } from "@/lib/orders/events";

export type AdminActionState = { error?: string; success?: string } | null;

const fulfilmentSchema = z.object({
  orderId: z.string().trim().min(1),
  status: z.enum(["UNFULFILLED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
  courierName: z.string().trim().max(120).optional(),
  trackingNumber: z.string().trim().max(120).optional(),
  trackingUrl: z.union([z.string().trim().url().max(500), z.literal("")]).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function updateFulfilmentAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession();

  const parsed = fulfilmentSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    courierName: formData.get("courierName") || undefined,
    trackingNumber: formData.get("trackingNumber") || undefined,
    trackingUrl: formData.get("trackingUrl") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid update." };
  }
  const { orderId, status, courierName, trackingNumber, trackingUrl, notes } = parsed.data;

  const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { courierName: true, fulfilmentStatus: true } });
  if (!existing) return { error: "Order not found." };

  if (fulfilmentRequiresCourier(status) && !(courierName || existing.courierName)) {
    return { error: "Courier name is required to mark an order Shipped." };
  }

  try {
    if (status !== existing.fulfilmentStatus) {
      // A real transition: applyFulfilmentStatus records history and notifies.
      await applyFulfilmentStatus({
        orderId,
        status,
        courierName: courierName ?? null,
        trackingNumber: trackingNumber ?? null,
        trackingUrl: trackingUrl || null,
        notes: notes ?? null,
      });
    } else {
      // Same status — e.g. fixing a typo in the tracking number after the
      // order was already marked Shipped. A detail-only edit, deliberately
      // no event/notification, matching the raw admin API's behavior.
      await prisma.order.update({
        where: { id: orderId },
        data: {
          courierName: courierName ?? null,
          trackingNumber: trackingNumber ?? null,
          trackingUrl: trackingUrl || null,
          notes: notes ?? null,
        },
      });
    }
  } catch (error) {
    console.error("admin_fulfilment_update_failed", error);
    return { error: "Couldn't update fulfilment status. Please try again." };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { success: "Fulfilment status updated." };
}

const paymentOverrideSchema = z.object({
  orderId: z.string().trim().min(1),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUND_PENDING", "REFUNDED"]),
});

/** For genuine out-of-band cases only (e.g. a refund completed directly in
 * the Razorpay dashboard). Gateway webhooks remain the normal path for
 * payment status — this exists so the record can be corrected, not as the
 * everyday flow. */
export async function overridePaymentStatusAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession();

  const parsed = paymentOverrideSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid update." };

  let changed: boolean;
  try {
    changed = await applyPaymentStatus({
      orderId: parsed.data.orderId,
      status: parsed.data.status,
      metadata: { source: "admin_override" },
    });
  } catch (error) {
    console.error("admin_payment_override_failed", error);
    return { error: "Couldn't update payment status. Please try again." };
  }

  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/admin");
  if (!changed) return { error: "No change — the order already has that payment status." };
  return { success: "Payment status updated." };
}

const refundSchema = z.object({
  orderId: z.string().trim().min(1),
  amount: z.union([z.string().trim().min(1), z.literal("")]).optional(),
});

export async function issueRefundAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession();

  if (!isRazorpayConfigured()) {
    return { error: "Razorpay isn't connected yet — can't issue a refund." };
  }

  const parsed = refundSchema.safeParse({
    orderId: formData.get("orderId"),
    amount: formData.get("amount") || undefined,
  });
  if (!parsed.success) return { error: "Invalid refund request." };
  const { orderId, amount } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true, razorpayPaymentId: true, total: true },
  });
  if (!order) return { error: "Order not found." };
  if (order.paymentStatus !== "PAID") return { error: "Only a paid order can be refunded." };
  if (!order.razorpayPaymentId) return { error: "This order has no Razorpay payment to refund." };

  let parsedAmount: number | undefined;
  if (amount) {
    parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > order.total) {
      return { error: `Enter an amount between 1 and ${order.total}, or leave blank for a full refund.` };
    }
  }

  try {
    const refund = await refundPayment({
      paymentId: order.razorpayPaymentId,
      amount: parsedAmount,
      notes: { orderId, source: "admin" },
    });
    // REFUND_PENDING now; the refund.processed webhook moves it to REFUNDED
    // once Razorpay confirms — applyPaymentStatus's idempotent guard means
    // that later webhook call is a no-op if this already ran, and vice versa.
    await applyPaymentStatus({
      orderId,
      status: "REFUND_PENDING",
      razorpayRefundId: refund.id,
      metadata: { source: "admin", amount: parsedAmount ?? order.total },
    });
  } catch (error) {
    console.error("admin_refund_failed", error);
    return {
      error: error instanceof Error ? error.message : "Couldn't issue the refund. Please try again.",
    };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { success: "Refund initiated." };
}
