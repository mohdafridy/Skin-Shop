// Direct-UPI payment details, as supplied by the business.
//
// The VPA (UPI ID) is shown publicly on the payment page and encoded into the
// pay QR — it's a collection address meant to be shared, not a secret. Direct
// UPI has no gateway: the customer pays into this UPI account and the owner
// confirms the money landed, then marks the order paid from /admin. See the
// PENDING → PAID flow that admin's payment-status control already drives.

/** Order.paymentProvider value for a direct-UPI order (distinguishes it from
 * "razorpay" in the admin and everywhere the provider is inspected). */
export const UPI_PROVIDER_ID = "upi";

export const upiVpa = "theskinshopofficial@okicici";
export const upiPayeeName = "The Skin Shop";

/** Direct UPI is offered at checkout only when a VPA is configured. */
export function isUpiDirectEnabled(): boolean {
  return upiVpa.trim().length > 0;
}

/**
 * Build a UPI intent URL (`upi://pay?...`). Rendered as a QR it can be scanned
 * by any UPI app; opened directly on a phone it launches the app pre-filled
 * with payee, amount and note. `amount` is a whole-rupee integer, matching the
 * rest of the app; UPI expects it as a decimal string.
 *
 * Built by hand (not URLSearchParams) so spaces encode as %20 rather than "+"
 * — some UPI apps mis-parse "+" in the payee name.
 */
export function buildUpiIntentUrl({ amount, note }: { amount: number; note?: string }): string {
  const parts = [
    `pa=${encodeURIComponent(upiVpa)}`,
    `pn=${encodeURIComponent(upiPayeeName)}`,
    `am=${amount.toFixed(2)}`,
    `cu=INR`,
  ];
  if (note) parts.push(`tn=${encodeURIComponent(note)}`);
  return `upi://pay?${parts.join("&")}`;
}
