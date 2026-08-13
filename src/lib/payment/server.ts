import type { PaymentProviderId } from "./types";
import { isRazorpayConfigured } from "@/lib/razorpay";

/**
 * Server-side view of which gateway is active and whether it can actually
 * take money. Kept separate from payment/index.ts so route handlers don't
 * pull in the browser-facing provider implementations.
 */
export function getServerPaymentProviderId(): PaymentProviderId {
  return "razorpay";
}

/** True only when the active gateway's secrets are present. */
export function isActiveProviderConfigured(): boolean {
  return isRazorpayConfigured();
}

/** Actionable, non-leaking message for an unconfigured gateway. */
export function unconfiguredProviderMessage(): string {
  return "No payment gateway is connected yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to accept payment.";
}
