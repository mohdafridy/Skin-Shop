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
    <div className="group relative flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-2xl"
        aria-label={`View ${product.name}`}
      >
        <SmartImage
          src={product.image}
          alt={product.name}
          label={product.shortName ?? product.name}
          className="aspect-[4/5]"
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 48vw"
          imageClassName="transition duration-700 ease-out group-hover:scale-105"
        />
      </Link>

      <button
        type="button"
        onClick={() => toggle(product.slug)}
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wishlisted}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-sm transition hover:scale-105"
      >
        <HeartIcon
          filled={wishlisted}
          className={`h-4 w-4 ${wishlisted ? "text-burgundy" : "text-ink"}`}
        />
      </button>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs uppercase tracking-wide text-walnut/70">{product.category}</p>
        <Link href={`/products/${product.slug}`} className="mt-1">
          <h3 className="text-balance font-display text-lg leading-snug text-ink transition group-hover:text-burgundy">
            {product.shortName ?? product.name}
          </h3>
        </Link>

        <p className="mt-1 text-sm font-medium text-ink">
          {formatPrice(product.price, product.currency)}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              addItem(product);
              triggerAdded();
            }}
            className="rounded-full border border-burgundy px-4 py-2 text-xs font-medium text-burgundy transition hover:bg-burgundy hover:text-ivory"
          >
            {added ? "Added ✓" : "Quick Add"}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="text-xs font-medium text-walnut/70 underline-offset-2 transition hover:text-burgundy hover:underline"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}
