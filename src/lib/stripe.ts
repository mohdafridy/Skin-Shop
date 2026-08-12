import Stripe from "stripe";

/**
 * Lazy, safe Stripe access. Unlike a plain `new Stripe(process.env.STRIPE_SECRET_KEY)`
 * at module scope, this never throws just from being imported — it only
 * throws inside getStripe(), and only if something calls it while
 * unconfigured. That keeps every route that imports this module loadable
 * (and the rest of the site fully working) before real keys are added.
 */
let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  if (!cached) cached = new Stripe(key);
  return cached;
}

/** Stripe amounts are in the smallest currency unit (paise for INR). Every
 * price in this codebase is a whole-rupee integer — convert only here, at
 * the Stripe API boundary, never anywhere prices are stored or displayed. */
export function toStripeAmount(wholeCurrencyUnits: number): number {
  return Math.round(wholeCurrencyUnits * 100);
}
