/** Store launch highlights alongside existing product editorial JSON.
 * No cron or database migration: badges expire at read/render time. */
export const NEW_BADGE_DURATIONS = [30, 60, 90] as const;
export type NewBadgeDuration = (typeof NEW_BADGE_DURATIONS)[number];

export type NewBadgeSettings = {
  durationDays: NewBadgeDuration;
  startedAt: string;
};

export const DAY_MS = 24 * 60 * 60 * 1000;

export function readNewBadgeSettings(details: unknown): NewBadgeSettings | undefined {
  if (!details || typeof details !== "object" || Array.isArray(details)) return undefined;
  const config = (details as Record<string, unknown>).newBadge;
  if (!config || typeof config !== "object" || Array.isArray(config)) return undefined;
  const { durationDays, startedAt } = config as Record<string, unknown>;
  if (
    !NEW_BADGE_DURATIONS.some((duration) => duration === durationDays) ||
    typeof startedAt !== "string"
  ) return undefined;
  const start = Date.parse(startedAt);
  if (!Number.isFinite(start)) return undefined;
  return { durationDays: durationDays as NewBadgeDuration, startedAt };
}

export function newBadgeExpiry(settings: NewBadgeSettings): string {
  return new Date(Date.parse(settings.startedAt) + settings.durationDays * DAY_MS).toISOString();
}

export function activeNewBadgeUntil(details: unknown, now = Date.now()): string | undefined {
  const settings = readNewBadgeSettings(details);
  if (!settings) return undefined;
  const expires = newBadgeExpiry(settings);
  return Date.parse(expires) > now ? expires : undefined;
}

export function newBadgeDaysRemaining(settings: NewBadgeSettings, now = Date.now()): number {
  return Math.max(0, Math.ceil((Date.parse(newBadgeExpiry(settings)) - now) / DAY_MS));
}


/** Preserve the original countdown when editing unrelated product details.
 * A duration change or deliberate restart always starts a fresh window. */
export function chooseNewBadgeSettings(
  duration: NewBadgeDuration | null,
  previous: NewBadgeSettings | undefined,
  restart: boolean,
  now: Date,
): NewBadgeSettings | undefined {
  if (duration === null) return undefined;
  if (previous?.durationDays === duration && !restart) return previous;
  return { durationDays: duration, startedAt: now.toISOString() };
}
