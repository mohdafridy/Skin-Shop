import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/backend";
import {
  createPendingOrder,
  CheckoutError,
  CouponUnavailableError,
} from "@/lib/orders/create-pending-order";
import { isUpiDirectEnabled, UPI_PROVIDER_ID } from "@/data/payment";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const CHECKOUT_LIMIT = 15;
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Direct-UPI checkout. Creates the order as PENDING and hands the browser a
 * link to the pay page (UPI ID + amount QR). There is no gateway and no
 * automatic confirmation: the owner verifies the money landed in their bank
 * and marks the order paid from /admin. The order is real from creation, so
 * it appears in admin immediately as an unpaid UPI order.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  // Shares the checkout rate-limit budget with the gateway path.
  const { allowed } = await checkRateLimit(`checkout:${ip}`, CHECKOUT_LIMIT, CHECKOUT_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many attempts. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  if (!isUpiDirectEnabled()) {
    return NextResponse.json(
      { error: "not_configured", message: "Direct UPI payment isn't available right now." },
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
      { error: "invalid_request", message: "Invalid checkout request." },
      { status: 400 },
    );
  }

  try {
    const { order } = await createPendingOrder(parsed.data, { provider: UPI_PROVIDER_ID });
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      accessToken: order.accessToken,
      payUrl: `/pay/${order.accessToken}`,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: "line_unavailable", message: error.message },
        { status: 409 },
      );
    }
    if (error instanceof CouponUnavailableError) {
      return NextResponse.json(
        { error: "coupon_unavailable", message: error.message },
        { status: 409 },
      );
    }
    console.error("upi_checkout_failed", error);
    return NextResponse.json(
      { error: "checkout_failed", message: "Unable to place your order right now. Please try again." },
      { status: 500 },
    );
  }
}
