/**
 * Coupon architecture. No active codes have been issued by the business —
 * `coupons` is intentionally empty, so `validateCoupon` will correctly
 * reject every code a customer enters until real ones are added here.
 * Never add a placeholder/demo code; that would let someone discover and
 * use a discount that was never actually authorised.
 */

export type Coupon = {
  code: string;
  type: "percentage" | "fixed";
  /** Percentage points (0-100) or a flat rupee amount, depending on `type`. */
  value: number;
  minOrderValue?: number;
  /** ISO date string; coupon is invalid on or after this date. */
  expiresAt?: string;
  /** Restrict to specific product slugs. Omit to allow all products. */
  eligibleProductSlugs?: string[];
  /** Restrict to specific combo slugs. Omit to allow all combos. */
  eligibleComboSlugs?: string[];
};

export const coupons: Coupon[] = [];

export type CouponCartLine = {
  type: "product" | "combo";
  slug: string;
};

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discount: number }
  | { valid: false; reason: string };

export function validateCoupon(
  code: string,
  cart: { lines: CouponCartLine[]; subtotal: number },
): CouponValidationResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, reason: "Enter a coupon code." };
  }

  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);
  if (!coupon) {
    return { valid: false, reason: "That code isn't valid." };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now()) {
    return { valid: false, reason: "That code has expired." };
  }

  if (coupon.minOrderValue && cart.subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      reason: `This code needs a minimum order of ₹${coupon.minOrderValue}.`,
    };
  }

  const eligibleLines = cart.lines.filter((line) => {
    if (line.type === "product" && coupon.eligibleProductSlugs) {
      return coupon.eligibleProductSlugs.includes(line.slug);
    }
    if (line.type === "combo" && coupon.eligibleComboSlugs) {
      return coupon.eligibleComboSlugs.includes(line.slug);
    }
    return true;
  });

  if (eligibleLines.length === 0) {
    return { valid: false, reason: "This code doesn't apply to the items in your bag." };
  }

  const discount =
    coupon.type === "percentage"
      ? Math.round(cart.subtotal * (coupon.value / 100))
      : Math.min(coupon.value, cart.subtotal);

  return { valid: true, coupon, discount };
}
