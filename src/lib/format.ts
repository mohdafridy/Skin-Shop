/**
 * Every price in this codebase is a whole-currency-unit integer (₹380 = 380).
 * Payment gateways bill in the smallest unit (paise). Convert only at a
 * gateway API boundary — never where prices are stored, compared or shown.
 */
export function toMinorUnits(wholeCurrencyUnits: number): number {
  return Math.round(wholeCurrencyUnits * 100);
}

export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
