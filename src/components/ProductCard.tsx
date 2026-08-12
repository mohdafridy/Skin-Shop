import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const onSale =
    product.compare_at_price_cents !== null &&
    product.compare_at_price_cents > product.price_cents;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white/60 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/5"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-dark">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-terracotta px-2.5 py-1 text-xs font-semibold text-white">
            Sale
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-cream">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg leading-snug text-ink">{product.name}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-ink">{formatPrice(product.price_cents)}</span>
          {onSale && (
            <span className="text-ink-soft line-through">
              {formatPrice(product.compare_at_price_cents!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
