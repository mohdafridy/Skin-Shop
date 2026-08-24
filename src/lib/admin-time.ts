/**
 * India Standard Time is a fixed UTC+05:30 with no daylight saving, so a
 * single constant offset is enough to anchor "today"/"this month" windows to
 * the shop's local day rather than the server's UTC day. Timestamps are
 * stored in UTC; these helpers return the UTC instant of an IST boundary.
 */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** UTC instant of the start (00:00 IST) of the IST calendar day containing `at`. */
export function istDayStart(at: Date): Date {
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  const midnightIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  return new Date(midnightIst - IST_OFFSET_MS);
}

/** UTC instant of the start (00:00 IST on the 1st) of the IST calendar month containing `at`. */
export function istMonthStart(at: Date): Date {
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  const firstOfMonthIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1);
  return new Date(firstOfMonthIst - IST_OFFSET_MS);
}

/** Format a UTC timestamp as "YYYY-MM-DD HH:mm" in IST, for CSV/exports. */
export function formatIstDateTime(at: Date): string {
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const mo = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  const h = String(ist.getUTCHours()).padStart(2, "0");
  const mi = String(ist.getUTCMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d} ${h}:${mi}`;
}
