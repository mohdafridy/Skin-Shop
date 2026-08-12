import Link from "next/link";
import Image from "next/image";
import { createSupabaseClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ProductCard";
import type { Category } from "@/lib/types";

export default async function HomePage() {
  const supabase = createSupabaseClient();

  const [{ data: featured }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage-dark">
              Clean &amp; effective skincare
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
              Skincare that lets your skin do the talking
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
              Thoughtfully formulated cleansers, serums, and moisturizers made
              with clean ingredients &mdash; for every skin type, every day.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream transition hover:bg-ink/85"
              >
                Shop All Products
              </Link>
              <Link
                href="/shop?category=serums"
                className="rounded-full border border-border px-7 py-3 text-sm font-semibold text-ink transition hover:border-sage hover:text-sage-dark"
              >
                Explore Serums
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream-dark">
            <Image
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000"
              alt="Skincare products arranged on a soft surface"
              fill
              priority
              sizes="(min-width: 1024px) 480px, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-wrap gap-3">
            {categories.map((category: Category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="rounded-full border border-border bg-white/60 px-5 py-2 text-sm font-medium text-ink-soft transition hover:border-sage hover:text-sage-dark"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured && featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl text-ink">Customer favorites</h2>
            <Link href="/shop" className="text-sm font-semibold text-sage-dark hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 rounded-3xl border border-border bg-white/50 p-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg text-ink">Clean formulas</p>
            <p className="mt-2 text-sm text-ink-soft">
              No sulfates, parabens, or synthetic fragrance &mdash; ever.
            </p>
          </div>
          <div>
            <p className="font-display text-lg text-ink">Dermatologist tested</p>
            <p className="mt-2 text-sm text-ink-soft">
              Every product is tested for safety on all skin types.
            </p>
          </div>
          <div>
            <p className="font-display text-lg text-ink">Free shipping</p>
            <p className="mt-2 text-sm text-ink-soft">
              On all orders over &#8377;1,999, delivered to your door.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
