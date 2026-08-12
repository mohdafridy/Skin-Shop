import type { OrderForPayment, PaymentInitiationResult, PaymentProvider } from "./types";

/**
 * Always attempts a real checkout — the server route (`/api/checkout`) is
 * the authoritative source of whether Stripe is actually configured. When
 * it isn't, the route responds 503 and this resolves to the same honest
 * "unavailable" shape unconfiguredProvider used, so the UI doesn't need to
 * know which case it's in until keys are added and it starts succeeding.
 */
export const stripeCheckoutProvider: PaymentProvider = {
  id: "stripe",
  name: "Stripe",
  isConfigured: true,
  async initiate(order: OrderForPayment): Promise<PaymentInitiationResult> {
    let response: Response;
    try {
      response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: order.lines,
          couponCode: order.couponCode ?? null,
          shipping: order.shipping,
          source: order.source,
        }),
      });
    } catch {
      return {
        status: "unavailable",
        reason: "We couldn't reach the payment service. Please check your connection and try again.",
      };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      return {
        status: "unavailable",
        reason:
          data?.message ??
          "No payment gateway is connected yet. Add a Razorpay, Stripe, or other approved provider integration to accept payment.",
      };
    }

    if (!data?.checkoutUrl) {
      return { status: "unavailable", reason: "We couldn't start checkout. Please try again in a moment." };
    }

    return { status: "redirect", url: data.checkoutUrl };
  },
};
