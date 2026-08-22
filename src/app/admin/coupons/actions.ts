"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export type AdminActionState = { error?: string; success?: string } | null;

/**
 * Owner-only coupon generator. Every code created here is single-use
 * (usageLimit = 1), so once a chosen customer redeems it at checkout the
 * code is spent for good — checkout increments timesUsed and
 * couponIsUsable() then rejects it. Codes are never surfaced anywhere on
 * the storefront; the owner reads the code off this admin screen and hands
 * it to the customer personally.
 */

const createSchema = z
  .object({
    // Owner-chosen code. Uppercased before saving so redemption (which
    // uppercases the customer's input) always matches.
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters.")
      .max(40, "Code is too long.")
      .regex(/^[A-Za-z0-9-]+$/, "Use only letters, numbers and hyphens."),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.coerce.number().int().positive("Enter a value greater than zero."),
    minimumSubtotal: z.coerce.number().int().nonnegative().optional(),
    expiresAt: z.string().trim().optional(),
  })
  .refine((d) => d.type !== "PERCENTAGE" || d.value <= 100, {
    message: "A percentage discount can't be more than 100%.",
    path: ["value"],
  });

export async function createCouponAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession();

  const parsed = createSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    minimumSubtotal: formData.get("minimumSubtotal") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid coupon." };
  }

  const { code, type, value, minimumSubtotal, expiresAt } = parsed.data;

  let expires: Date | null = null;
  if (expiresAt) {
    // <input type="date"> gives YYYY-MM-DD; treat it as end-of-day so the
    // code stays valid through the whole chosen date in local terms.
    const d = new Date(`${expiresAt}T23:59:59`);
    if (Number.isNaN(d.getTime())) return { error: "Invalid expiry date." };
    expires = d;
  }

  try {
    await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minimumSubtotal: minimumSubtotal && minimumSubtotal > 0 ? minimumSubtotal : null,
        usageLimit: 1, // single-use: burns after one redemption
        active: true,
        expiresAt: expires,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That code already exists. Choose a different one." };
    }
    console.error("admin_coupon_create_failed", error);
    return { error: "Couldn't create this coupon. Please try again." };
  }

  revalidatePath("/admin/coupons");
  return { success: `Coupon ${code.toUpperCase()} created. Give it to your customer.` };
}

const toggleSchema = z.object({
  couponId: z.string().trim().min(1),
  active: z.enum(["true", "false"]),
});

export async function setCouponActiveAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession();

  const parsed = toggleSchema.safeParse({
    couponId: formData.get("couponId"),
    active: formData.get("active"),
  });
  if (!parsed.success) return { error: "Invalid update." };

  try {
    await prisma.coupon.update({
      where: { id: parsed.data.couponId },
      data: { active: parsed.data.active === "true" },
    });
  } catch (error) {
    console.error("admin_coupon_toggle_failed", error);
    return { error: "Couldn't update this coupon. Please try again." };
  }

  revalidatePath("/admin/coupons");
  return { success: "Saved." };
}
