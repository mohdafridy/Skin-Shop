import type { PaymentProvider, PaymentProviderId } from "./types";
import { unconfiguredProvider } from "./unconfigured-provider";

export type { PaymentProvider, PaymentProviderId, OrderForPayment, PaymentInitiationResult } from "./types";

/**
 * Registry of available providers. Add a real one here (e.g. a Razorpay
 * implementation of `PaymentProvider`) and switch `activeProviderId` once
 * its API keys exist — nothing else in checkout needs to change.
 */
const providers: Record<PaymentProviderId, PaymentProvider> = {
  unconfigured: unconfiguredProvider,
  razorpay: unconfiguredProvider,
  stripe: unconfiguredProvider,
  cod: unconfiguredProvider,
};

const activeProviderId: PaymentProviderId = "unconfigured";

export function getActivePaymentProvider(): PaymentProvider {
  return providers[activeProviderId];
}
