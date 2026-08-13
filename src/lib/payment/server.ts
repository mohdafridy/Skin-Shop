import type { PaymentProviderId } from "./types";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { isStripeConfigured } from "@/lib/stripe";

/**
 * Server-side view of which gateway is active and whether it can actually
 * take money. Kept separate from payment/index.ts so route handlers don't
 * pull in the browser-facing provider implementations.
 */
export function getServerPaymentProviderId(): PaymentProviderId {
  const configured = (
    process.env.PAYMENT_PROVIDER || process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || "razorpay"
  ).toLowerCase();
  return configured === "stripe" ? "stripe" : "razorpay";
}

/** True only when the active gateway's secrets are present. */
export function isActiveProviderConfigured(): boolean {
  return getServerPaymentProviderId() === "stripe" ? isStripeConfigured() : isRazorpayConfigured();
}

/** Actionable, non-leaking message for an unconfigured gateway. */
export function unconfiguredProviderMessage(): string {
  return getServerPaymentProviderId() === "stripe"
    ? "No payment gateway is connected yet. Set STRIPE_SECRET_KEY to accept payment."
    : "No payment gateway is connected yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to accept payment.";
}
