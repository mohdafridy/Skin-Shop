/**
 * Payment provider abstraction. Razorpay is the only real gateway, but the
 * checkout UI is built against this interface — not Razorpay's API directly
 * — so a future provider swap touches this module, not checkout code.
 */

export type PaymentProviderId = "razorpay" | "cod" | "unconfigured";

export type OrderForPayment = {
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  lines: { type: "product" | "combo"; slug: string; quantity: number }[];
  couponCode?: string | null;
  /** "cart" for a normal checkout, "buy_now" when the persistent cart was
   * never touched — order-success must only clear the cart for "cart". */
  source: "cart" | "buy_now";
  shipping: {
    name: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
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
