import { prisma } from "@/lib/prisma";

/**
 * Fixed-window rate limiter backed by Postgres, not an in-memory Map —
 * Vercel's functions are short-lived and multi-instance, so an in-memory
 * counter resets constantly and never sees traffic hitting a different
 * instance. Not built for high-QPS endpoints; fine for the handful of
 * low-frequency, sensitive ones that need it (login, admin login, coupon
 * guesses).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean }> {
  const windowStart = new Date(Date.now() - windowMs);

  const count = await prisma.rateLimitAttempt.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (count >= limit) return { allowed: false };

  await prisma.rateLimitAttempt.create({ data: { key } });

  // Best-effort prune of this key's old rows so the table doesn't grow
  // unbounded. Never blocks the response — a failed prune just means a
  // slightly larger table until the next successful one.
  prisma.rateLimitAttempt.deleteMany({ where: { key, createdAt: { lt: windowStart } } }).catch(() => {});

  return { allowed: true };
}

/** First IP in x-forwarded-for is the original client on Vercel's edge.
 * Accepts anything with a `.get()` — both Request.headers and Next.js's
 * `next/headers` readonly Headers satisfy this. */
export function getClientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}
