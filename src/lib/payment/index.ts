import type { PaymentProvider, PaymentProviderId } from "./types";
import { unconfiguredProvider } from "./unconfigured-provider";
import { stripeCheckoutProvider } from "./stripe-checkout-provider";
import { razorpayProvider } from "./razorpay-provider";

export type { PaymentProvider, PaymentProviderId, OrderForPayment, PaymentInitiationResult } from "./types";

/**
 * Registry of available providers. Both real providers always attempt a live
 * checkout via /api/checkout; that route is the authoritative check for
 * whether the gateway's secrets are actually set, so a provider stays
 * selectable before credentials exist — it just resolves to the same honest
 * "unavailable" state until they are added server-side.
 */
const providers: Record<PaymentProviderId, PaymentProvider> = {
  unconfigured: unconfiguredProvider,
  razorpay: razorpayProvider,
  stripe: stripeCheckoutProvider,
  cod: unconfiguredProvider,
};

/**
 * Which gateway checkout uses. Razorpay is the default for this store (INR,
 * UPI-first); set PAYMENT_PROVIDER=stripe to switch back without code changes.
 *
 * NEXT_PUBLIC_ prefixed because the checkout UI is a client component and has
 * to know which provider's flow to run. It names a provider only — no key,
 * and never a secret.
 */
export function getActivePaymentProviderId(): PaymentProviderId {
  const configured = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER?.toLowerCase();
  if (configured === "stripe") return "stripe";
  if (configured === "razorpay") return "razorpay";
  return "razorpay";
}

export function getActivePaymentProvider(): PaymentProvider {
  return providers[getActivePaymentProviderId()];
}
