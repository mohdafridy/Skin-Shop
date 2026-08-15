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

/** "Today" / "Yesterday" / "3 days ago" within the last week, otherwise a
 * plain date — used for review timestamps. */
export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
