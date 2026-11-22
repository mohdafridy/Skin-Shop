import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { readNewBadgeSettings, newBadgeDaysRemaining } from "@/lib/new-arrival";
import AdminHeader from "../AdminHeader";
import ProductsManager, { type AdminProductRow } from "./ProductsManager";

export const metadata: Metadata = { title: "Product manager", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminSession();
  const rows = await prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    select: {
      id: true, slug: true, name: true, category: true, collection: true,
      price: true, currency: true, image: true, stock: true, active: true, details: true,
    },
  });

  const products: AdminProductRow[] = rows.map((row) => {
    const settings = readNewBadgeSettings(row.details);
    return {
      id: row.id, slug: row.slug, name: row.name, category: row.category,
      collection: row.collection, price: row.price, currency: row.currency,
      image: row.image, stock: row.stock, active: row.active,
      newBadge: settings ? {
        durationDays: settings.durationDays,
        daysRemaining: newBadgeDaysRemaining(settings),
      } : undefined,
    };
  });

  return (
    <div className="mx-auto max-w-standard px-5 py-10 sm:px-8">
      <AdminHeader title="Manage products" />
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-ink">Your product collection</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-walnut/70">
            Edit names, prices, images and launch badges yourself. Use Quick stock for fast inventory updates.
          </p>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-burgundy px-6 py-3 text-sm font-semibold text-ivory shadow-sm transition hover:bg-burgundy-dark">
          + Add a product
        </Link>
      </div>
      <ProductsManager products={products} />
    </div>
  );
}
