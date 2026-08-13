import type { OrderForPayment, PaymentInitiationResult, PaymentProvider } from "./types";

/**
 * Razorpay implementation of the existing PaymentProvider interface.
 *
 * Like the Stripe provider, this always calls /api/checkout and lets the
 * server be the authority on whether credentials exist — so the UI needs no
 * knowledge of configuration state and starts working the moment real keys
 * are added.
 *
 * Razorpay's Checkout is a browser modal rather than a redirect, so this
 * resolves to the interface's existing `client-side` variant carrying the
 * public key id and gateway order id. No secret ever reaches the browser.
 */
export const razorpayProvider: PaymentProvider = {
  id: "razorpay",
  name: "Razorpay",
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
        reason: data?.message ?? "We couldn't start checkout. Please try again in a moment.",
      };
    }

    if (!data?.razorpay?.keyId || !data?.razorpay?.orderId) {
      return {
        status: "unavailable",
        reason: "We couldn't start checkout. Please try again in a moment.",
      };
    }

    return {
      status: "client-side",
      provider: "razorpay",
      config: {
        keyId: data.razorpay.keyId,
        razorpayOrderId: data.razorpay.orderId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        accessToken: data.accessToken,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.shipping.phone,
      },
    };
  },
};
