import type { PaymentProvider, PaymentProviderId } from "./types";
import { unconfiguredProvider } from "./unconfigured-provider";
import { stripeCheckoutProvider } from "./stripe-checkout-provider";

export type { PaymentProvider, PaymentProviderId, OrderForPayment, PaymentInitiationResult } from "./types";

/**
 * Registry of available providers. `stripe` always attempts a real
 * checkout via /api/checkout; that route is the authoritative check for
 * whether STRIPE_SECRET_KEY is actually set, so this stays active even
 * before real keys exist — it just resolves to the same honest
 * "unavailable" state unconfiguredProvider always returned, until keys
 * are added server-side.
 */
const providers: Record<PaymentProviderId, PaymentProvider> = {
  unconfigured: unconfiguredProvider,
  razorpay: unconfiguredProvider,
  stripe: stripeCheckoutProvider,
  cod: unconfiguredProvider,
};

const activeProviderId: PaymentProviderId = "stripe";

export function getActivePaymentProvider(): PaymentProvider {
  return providers[activeProviderId];
}
