import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { asStorefrontProduct } from "@/lib/storefront-catalog";
import { readNewBadgeSettings } from "@/lib/new-arrival";
import AdminHeader from "../../../AdminHeader";
import ProductEditorForm from "../../ProductEditorForm";

export const metadata: Metadata = { title: "Edit Product", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;
  const [row, productChoices] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.product.findMany({
      select: { slug: true, name: true, category: true }, orderBy: { name: "asc" },
    }),
  ]);
  if (!row) notFound();
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
      <AdminHeader title="Edit product" />
      <p className="mb-7 text-sm text-walnut/70">Changes to names, prices, and descriptions will appear on the shop and be used at checkout.</p>
      <ProductEditorForm recordId={id} product={asStorefrontProduct(row)} newBadgeSettings={readNewBadgeSettings(row.details)} productChoices={productChoices} />
    </div>
  );
}
