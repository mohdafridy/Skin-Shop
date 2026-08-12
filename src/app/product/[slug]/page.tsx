import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/client";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createSupabaseClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const { data: related } = product.category_id
    ? await supabase
        .from("products")
        .select("*")
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .limit(4)
    : { data: [] };

  const onSale =
    product.compare_at_price_cents !== null &&
    product.compare_at_price_cents > product.price_cents;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <nav className="mb-8 text-sm text-ink-soft">
        <Link href="/shop" className="hover:text-sage-dark">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-cream-dark">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 540px, 90vw"
              className="object-cover"
            />
          )}
        </div>

        <div>
          <h1 className="font-display text-4xl text-ink">{product.name}</h1>

          {product.rating && (
            <div className="mt-3 flex items-center gap-1 text-sm text-ink-soft">
              <span aria-hidden className="text-terracotta">
                {"★".repeat(Math.round(product.rating))}
                {"☆".repeat(5 - Math.round(product.rating))}
              </span>
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-ink">
              {formatPrice(product.price_cents)}
            </span>
            {onSale && (
              <span className="text-lg text-ink-soft line-through">
                {formatPrice(product.compare_at_price_cents!)}
              </span>
            )}
          </div>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft">
            {product.description}
          </p>

          {product.skin_type.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.skin_type.map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-cream-dark px-3 py-1 text-xs font-medium text-ink-soft"
                >
                  {type} skin
                </span>
              ))}
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          {product.ingredients && (
            <div className="mt-10 border-t border-border pt-6">
              <p className="text-sm font-semibold text-ink">Key ingredients</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {product.ingredients}
              </p>
            </div>
          )}
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-3xl text-ink">You may also like</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
