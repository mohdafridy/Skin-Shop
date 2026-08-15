"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export type AdminActionState = { error?: string; success?: string } | null;

const statusSchema = z.object({
  reviewId: z.string().trim().min(1),
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
});

export async function setReviewStatusAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession();

  const parsed = statusSchema.safeParse({
    reviewId: formData.get("reviewId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid update." };

  try {
    await prisma.review.update({
      where: { id: parsed.data.reviewId },
      data: { status: parsed.data.status },
    });
  } catch (error) {
    console.error("admin_review_status_update_failed", error);
    return { error: "Couldn't update this review. Please try again." };
  }

  revalidatePath("/admin/reviews");
  return { success: "Saved." };
}
