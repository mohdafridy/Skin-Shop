"use client";

import Link from "next/link";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { formatPrice } from "@/lib/format";
import { useAddedFeedback } from "@/lib/use-added-feedback";
import { HeartIcon } from "./icons";
import SmartImage from "./SmartImage";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [added, triggerAdded] = useAddedFeedback();
  const wishlisted = isWishlisted(product.slug);

  return (
    <div className="group relative flex flex-col rounded-md transition-[transform,box-shadow] duration-[350ms] ease-premium hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(69,48,42,0.07)]">
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-md"
        aria-label={`View ${product.name}`}
      >
        <SmartImage
          src={product.image}
          alt={product.name}
          label={product.shortName ?? product.name}
          className="aspect-[4/5]"
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 48vw"
          imageClassName="transition-transform duration-[450ms] ease-premium group-hover:scale-[1.03]"
        />
      </Link>

      <button
        type="button"
        onClick={() => toggle(product.slug)}
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wishlisted}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-sm transition-transform duration-[180ms] ease-premium hover:scale-105 active:scale-95"
      >
        <HeartIcon
          filled={wishlisted}
          className={`h-4 w-4 ${wishlisted ? "text-burgundy" : "text-ink"}`}
        />
      </button>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.14em] text-walnut/55">{product.category}</p>
        <Link href={`/products/${product.slug}`} className="mt-2">
          <h3 className="text-balance font-display text-xl font-semibold leading-[1.2] tracking-tight text-ink transition-colors duration-300 ease-premium group-hover:text-burgundy">
            {product.shortName ?? product.name}
          </h3>
        </Link>

        <p className="mt-2 text-sm tracking-wide text-walnut/80">
          {formatPrice(product.price, product.currency)}
        </p>

        <div className="mt-5 flex flex-col">
          <button
            type="button"
            onClick={() => {
              addItem(product);
              triggerAdded();
            }}
            className="w-full rounded-md border border-burgundy px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-burgundy transition-[background-color,color,transform] duration-300 ease-premium hover:bg-burgundy hover:text-ivory active:scale-[0.98]"
          >
            {added ? "Added ✓" : "Quick Add"}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="group/view mt-3 inline-flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wide text-walnut/50 transition-colors duration-300 ease-premium hover:text-burgundy"
          >
            View Product
            <span
              aria-hidden="true"
              className="transition-transform duration-[180ms] ease-premium group-hover/view:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
