import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, razorpayPublicKeyId } from "@/lib/razorpay";
import { toMinorUnits } from "@/lib/format";
import { checkoutSchema } from "@/lib/backend";
import {
  createPendingOrder,
  CheckoutError,
  CouponUnavailableError,
} from "@/lib/orders/create-pending-order";
import {
  getServerPaymentProviderId,
  isActiveProviderConfigured,
  unconfiguredProviderMessage,
} from "@/lib/payment/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const CHECKOUT_LIMIT = 15;
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  // Throttle order-creation attempts per IP — guards against order-row and
  // coupon-reservation spam without impeding a real shopper retrying.
  const ip = getClientIp(request.headers);
  const { allowed } = await checkRateLimit(`checkout:${ip}`, CHECKOUT_LIMIT, CHECKOUT_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many attempts. Please wait a moment and try again." },
      { status: 429 },
    );
  }

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
    const provider = getServerPaymentProviderId();

    // Validate, price, reserve any coupon and create the PENDING order. Shared
    // with the direct-UPI path so the money math can never diverge between them.
    const { order, coupon, couponReserved, total, currency } = await createPendingOrder(
      parsed.data,
      { provider },
    );

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
    // Availability problems are the shopper's to resolve, so their (already
    // sanitized) message is returned; otherwise a retry tells them nothing.
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: "line_unavailable", message: error.message },
        { status: 409 },
      );
    }

    // A limited coupon's last use was taken between validation and reservation.
    if (error instanceof CouponUnavailableError) {
      return NextResponse.json(
        { error: "coupon_unavailable", message: error.message },
        { status: 409 },
      );
    }

    console.error("checkout_failed", error);

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
