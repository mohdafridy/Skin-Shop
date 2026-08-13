import type { PaymentProvider, PaymentProviderId } from "./types";
import { unconfiguredProvider } from "./unconfigured-provider";
import { razorpayProvider } from "./razorpay-provider";

export type { PaymentProvider, PaymentProviderId, OrderForPayment, PaymentInitiationResult } from "./types";

/**
 * Registry of available providers. Razorpay always attempts a live checkout
 * via /api/checkout; that route is the authoritative check for whether
 * RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are actually set, so it stays
 * selectable before credentials exist — it just resolves to the same honest
 * "unavailable" state until they are added server-side.
 */
const providers: Record<PaymentProviderId, PaymentProvider> = {
  unconfigured: unconfiguredProvider,
  razorpay: razorpayProvider,
  cod: unconfiguredProvider,
};

export function getActivePaymentProviderId(): PaymentProviderId {
  return "razorpay";
}

export function getActivePaymentProvider(): PaymentProvider {
  return providers[getActivePaymentProviderId()];
}
