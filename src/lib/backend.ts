import { timingSafeEqual } from "node:crypto";
import { DiscountType, type Coupon } from "@prisma/client";
import { z } from "zod";

export const checkoutLineSchema = z.object({
  type: z.enum(["product", "combo"]),
  slug: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(20),
});

/// No purchase or account verification — guest checkout is the default here
/// too, so a review is just a submission. Every new row lands PENDING and
/// only reaches the site after /admin/reviews approves it (see Review in
/// prisma/schema.prisma).
export const reviewSchema = z.object({
  type: z.enum(["product", "combo"]),
  slug: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5),
  authorName: z.string().trim().min(1).max(120),
  authorEmail: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  body: z.string().trim().min(10).max(2000),
});

export const shippingAddressSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(20),
  address1: z.string().trim().min(1).max(200),
  address2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100),
});

export const checkoutSchema = z.object({
  lines: z.array(checkoutLineSchema).min(1).max(50),
  couponCode: z.string().trim().max(64).optional().nullable(),
  shipping: shippingAddressSchema,
  source: z.enum(["cart", "buy_now"]).default("cart"),
});

export const productSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(160),
  shortName: z.string().trim().max(160).optional().nullable(),
  category: z.string().trim().min(1).max(100),
  collection: z.string().trim().min(1).max(100),
  price: z.number().int().nonnegative(),
  currency: z.string().trim().length(3).default("INR"),
  image: z.string().trim().min(1),
  active: z.boolean().default(true),
  stock: z.number().int().nonnegative().optional().nullable(),
});

export function isAdminRequest(request: Request) {
  const expected = process.env.ADMIN_API_KEY?.trim();
  const provided = request.headers.get("x-admin-key")?.trim();
  if (!expected || !provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function couponIsUsable(coupon: Coupon, subtotal: number) {
  const now = new Date();
  return (
    coupon.active &&
    (!coupon.startsAt || coupon.startsAt <= now) &&
    (!coupon.expiresAt || coupon.expiresAt >= now) &&
    (coupon.usageLimit === null || coupon.timesUsed < coupon.usageLimit) &&
    (coupon.minimumSubtotal === null || subtotal >= coupon.minimumSubtotal)
  );
}

export function calculateDiscount(coupon: Coupon, subtotal: number) {
  let amount =
    coupon.type === DiscountType.PERCENTAGE
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;
  if (coupon.maxDiscount !== null) amount = Math.min(amount, coupon.maxDiscount);
  return Math.max(0, Math.min(amount, subtotal));
}

export function createOrderNumber() {
  const d = new Date();
  const date = `${d.getUTCFullYear().toString().slice(-2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `TSS-${date}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
