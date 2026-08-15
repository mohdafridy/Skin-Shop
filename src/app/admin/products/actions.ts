"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export type AdminActionState = { error?: string; success?: string } | null;

const stockSchema = z.object({
  productId: z.string().trim().min(1),
  // Blank input means "unlimited / not stock-tracked" — mirrors Product.stock's
  // null-means-unlimited convention (see prisma/schema.prisma).
  stock: z.union([z.string().trim().min(1), z.literal("")]).optional(),
  active: z.enum(["true", "false"]),
});

export async function updateProductStockAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession();

  const parsed = stockSchema.safeParse({
    productId: formData.get("productId"),
    stock: formData.get("stock") ?? "",
    active: formData.get("active"),
  });
  if (!parsed.success) return { error: "Invalid update." };

  const { productId, stock, active } = parsed.data;

  let stockValue: number | null = null;
  if (stock) {
    stockValue = Number(stock);
    if (!Number.isInteger(stockValue) || stockValue < 0) {
      return { error: "Stock must be a whole number of 0 or more, or left blank for unlimited." };
    }
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: stockValue, active: active === "true" },
    });
  } catch (error) {
    console.error("admin_product_stock_update_failed", error);
    return { error: "Couldn't update this product. Please try again." };
  }

  revalidatePath("/admin/products");
  return { success: "Saved." };
}
