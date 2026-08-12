import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ProductCard";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = createSupabaseClient();

  const { data: categories } = await supabase.from("categories").select("*").order("name");

  let query = supabase.from("products").select("*").order("name");
  const activeCategory = categories?.find((c) => c.slug === category);
  if (activeCategory) {
    query = query.eq("category_id", activeCategory.id);
  }

  const { data: products } = await query;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl text-ink">
          {activeCategory ? activeCategory.name : "Shop All"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          {activeCategory?.description ??
            "Browse our full range of clean, effective skincare essentials."}
        </p>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
            !activeCategory
              ? "border-sage bg-sage text-white"
              : "border-border bg-white/60 text-ink-soft hover:border-sage hover:text-sage-dark"
          }`}
        >
          All
        </Link>
        {categories?.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}`}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              activeCategory?.id === c.id
                ? "border-sage bg-sage text-white"
                : "border-border bg-white/60 text-ink-soft hover:border-sage hover:text-sage-dark"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-soft">No products found in this category.</p>
      )}
    </div>
  );
}
