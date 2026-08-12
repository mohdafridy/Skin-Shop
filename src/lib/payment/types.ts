/**
 * Payment provider abstraction. No gateway is connected yet — this defines
 * the shape a real integration (Razorpay, Stripe, etc.) would implement,
 * so the checkout UI can be built against a stable interface today and
 * swapped to a live provider later without touching checkout code.
 */

export type PaymentProviderId = "razorpay" | "stripe" | "cod" | "unconfigured";

export type OrderForPayment = {
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
};

export type PaymentInitiationResult =
  | { status: "redirect"; url: string }
  | { status: "client-side"; provider: PaymentProviderId; config: Record<string, unknown> }
  | { status: "unavailable"; reason: string };

/**
 * What every real payment provider must implement. `unconfigured`
 * satisfies this with a provider that always reports itself unavailable,
 * so checkout can call the same interface regardless of whether a real
 * gateway is connected.
 */
export type PaymentProvider = {
  id: PaymentProviderId;
  name: string;
  isConfigured: boolean;
  /** Begin a payment for the given order. Never call this expecting a
   * successful charge unless `isConfigured` is true. */
  initiate: (order: OrderForPayment) => Promise<PaymentInitiationResult>;
};
