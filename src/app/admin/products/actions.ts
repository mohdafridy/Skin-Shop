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

const addStockSchema = z.object({
  productId: z.string().trim().min(1),
  amount: z.string().trim().min(1),
});

/** Restocking shortcut: adds to whatever is already there instead of
 * requiring the admin to know and retype the current total. A product with
 * untracked (null) stock starts being tracked at exactly this amount. */
export async function addProductStockAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession();

  const parsed = addStockSchema.safeParse({
    productId: formData.get("productId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { error: "Invalid update." };

  const amount = Number(parsed.data.amount);
  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: "Enter a whole number greater than 0 to add." };
  }

  const existing = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { stock: true },
  });
  if (!existing) return { error: "Product not found." };

  const newStock = (existing.stock ?? 0) + amount;

  try {
    await prisma.product.update({
      where: { id: parsed.data.productId },
      data: { stock: newStock },
    });
  } catch (error) {
    console.error("admin_product_add_stock_failed", error);
    return { error: "Couldn't add stock. Please try again." };
  }

  revalidatePath("/admin/products");
  return { success: `Added ${amount} — new stock: ${newStock}.` };
}
