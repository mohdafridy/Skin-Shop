/**
 * Tax (GST) configuration. No rate has been supplied by the business, so
 * nothing here invents a percentage. Once a real rate is confirmed, set
 * `taxConfigured = true` and `taxRatePercent` — every consumer of
 * `calculateTax` updates automatically.
 */

export const taxConfigured = false;
export const taxRatePercent: number | null = null;

export function calculateTax(subtotal: number): number | null {
  if (!taxConfigured || taxRatePercent === null) return null;
  return Math.round(subtotal * (taxRatePercent / 100));
}
