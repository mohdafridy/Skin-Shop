import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/backend";
import { applyFulfilmentStatus, applyPaymentStatus, fulfilmentRequiresCourier } from "@/lib/orders/events";

/**
 * Store-owner order management. Guarded by isAdminRequest (x-admin-key), the
 * same gate the other admin routes use — ordinary customers have no route
 * that can reach fulfilment or payment status.
 *
 * Shipping is manual: the owner PATCHes a fulfilment status here, optionally
 * with courier details, and applyFulfilmentStatus records history and fires
 * the WhatsApp + email notifications for SHIPPED / OUT_FOR_DELIVERY /
 * DELIVERED / CANCELLED.
 */

type Params = Promise<{ id: string }>;

const schema = z
  .object({
    fulfilmentStatus: z
      .enum(["UNFULFILLED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"])
      .optional(),
    /** Payment status is settable for genuine out-of-band cases (a manual
     * refund recorded in the gateway dashboard). Gateway webhooks remain the
     * normal path — never the browser. */
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUND_PENDING", "REFUNDED"]).optional(),
    courierName: z.string().trim().max(120).nullish(),
    trackingNumber: z.string().trim().max(120).nullish(),
    trackingUrl: z.string().trim().url().max(500).nullish(),
    notes: z.string().trim().max(2000).nullish(),
  })
  .refine((v) => v.fulfilmentStatus || v.paymentStatus || v.courierName !== undefined || v.trackingNumber !== undefined || v.trackingUrl !== undefined || v.notes !== undefined, {
    message: "Nothing to update.",
  });

export async function PATCH(request: Request, { params }: { params: Params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid update." },
      { status: 400 },
    );
  }

  const { fulfilmentStatus, paymentStatus, courierName, trackingNumber, trackingUrl, notes } = parsed.data;

  try {
    const existing = await prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    // Marking an order shipped without tracking details leaves the customer
    // with a notification they can't act on — require them together.
    if (fulfilmentStatus && fulfilmentRequiresCourier(fulfilmentStatus)) {
      const willHaveCourier = courierName ?? (await prisma.order.findUnique({ where: { id }, select: { courierName: true } }))?.courierName;
      if (!willHaveCourier) {
        return NextResponse.json(
          { error: "invalid_request", message: "courierName is required when marking an order SHIPPED." },
          { status: 400 },
        );
      }
    }

    if (paymentStatus) {
      await applyPaymentStatus({
        orderId: id,
        status: paymentStatus,
        metadata: { source: "admin" },
      });
    }

    if (fulfilmentStatus) {
      await applyFulfilmentStatus({
        orderId: id,
        status: fulfilmentStatus,
        courierName,
        trackingNumber,
        trackingUrl,
        notes,
      });
    } else if (
      courierName !== undefined ||
      trackingNumber !== undefined ||
      trackingUrl !== undefined ||
      notes !== undefined
    ) {
      // Detail-only edit (fixing a typo in a tracking number). No status
      // change, so deliberately no notification.
      await prisma.order.update({
        where: { id },
        data: {
          ...(courierName !== undefined ? { courierName } : {}),
          ...(trackingNumber !== undefined ? { trackingNumber } : {}),
          ...(trackingUrl !== undefined ? { trackingUrl } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, events: { orderBy: { createdAt: "desc" }, take: 20 } },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("admin_order_update_failed", error);
    return NextResponse.json(
      { error: "update_failed", message: "Couldn't update that order." },
      { status: 500 },
    );
  }
}
