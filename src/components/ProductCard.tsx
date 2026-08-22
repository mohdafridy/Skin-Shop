"use client";

import Link from "next/link";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { formatPrice } from "@/lib/format";
import { useAddedFeedback } from "@/lib/use-added-feedback";
import { HeartIcon } from "./icons";
import SmartImage from "./SmartImage";

const focalPointBySlug: Record<string, string> = {
  "husn-e-yusuf-whitening-soap-cleanser": "product-photo--upper",
  "dahab-whitening-night-cream": "product-photo--upper",
  "ark-e-gulaab": "product-photo--upper",
  "vitamin-c-serum": "product-photo--upper",
  "rosemary-hair-serum": "product-photo--upper",
  "coffee-detox-facemask": "product-photo--upper",
  "moringa-whitening-soap-cleanser": "product-photo--upper",
  "argan-body-whitening-cream": "product-photo--upper",
  "jojoba-kids-soap": "product-photo--upper",
  "shea-lip-balm": "product-photo--upper",
  "husn-e-yusuf-exfoliator": "product-photo--upper",
  "saffron-gel": "product-photo--upper",
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [added, triggerAdded] = useAddedFeedback();
  const wishlisted = isWishlisted(product.slug);
  const focalPoint = focalPointBySlug[product.slug] ?? "";

  return (
    <article className="group relative flex min-w-0 flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden bg-sand/70"
        aria-label={`View ${product.name}`}
      >
        <SmartImage
          src={product.image}
          alt={product.name}
          label={product.shortName ?? product.name}
          className="aspect-[4/3]"
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 48vw"
          imageClassName={`product-photo ${focalPoint} transition-transform duration-[700ms] ease-premium group-hover:scale-[1.028]`}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </Link>

      <button
        type="button"
        onClick={() => toggle(product.slug)}
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wishlisted}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center text-ivory drop-shadow-[0_1px_6px_rgba(0,0,0,0.25)] transition-[transform,color] duration-200 ease-premium hover:scale-105 hover:text-white active:scale-95"
      >
        <HeartIcon filled={wishlisted} className={`h-[18px] w-[18px] ${wishlisted ? "text-burgundy" : ""}`} />
      </button>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-walnut/48">
              {product.category}
            </p>
            <Link href={`/products/${product.slug}`} className="mt-1.5 block">
              <h3 className="text-balance font-display text-[1.45rem] font-normal leading-[1.02] tracking-[-0.025em] text-ink transition-colors duration-300 ease-premium group-hover:text-burgundy sm:text-[1.55rem]">
                {product.shortName ?? product.name}
              </h3>
            </Link>
          </div>
          <p className="flex-shrink-0 pt-5 text-[0.82rem] font-medium tracking-wide text-walnut/75">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gold/20 pt-3">
          <button
            type="button"
            onClick={() => {
              addItem(product);
              triggerAdded();
            }}
            className="editorial-link text-burgundy lg:opacity-0 lg:transition-opacity lg:duration-300 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
          >
            {added ? "Added ✓" : "Quick Add"}
            <span aria-hidden="true">+</span>
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-walnut/50 transition-colors duration-200 hover:text-burgundy"
          >
            Discover <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
