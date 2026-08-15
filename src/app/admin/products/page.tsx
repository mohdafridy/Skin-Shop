import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "../AdminHeader";
import ProductRow from "./ProductRow";

export const metadata: Metadata = { title: "Products", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminSession();

  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true, stock: true, active: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <AdminHeader title="Products" />

      <p className="mb-6 text-sm text-walnut/70">
        Set a stock quantity to track inventory, or leave it blank for unlimited. Checkout blocks any
        order that would exceed the number here — set it to <strong>0</strong> (or use &ldquo;Mark out
        of stock&rdquo;) to stop a product from selling without removing it from the site. Turning{" "}
        <strong>Active</strong> off blocks checkout entirely for that product.
      </p>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-gold/20 bg-white/40 p-8 text-center text-walnut/70">
          No products yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gold/20">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold/20 bg-sand/30 text-xs uppercase tracking-wide text-walnut/60">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Stock &amp; active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  stock={product.stock}
                  active={product.active}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
