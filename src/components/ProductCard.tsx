"use client";

import Link from "next/link";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import SmartImage from "./SmartImage";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

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
            onClick={() => addItem(product)}
            className="rounded-full border border-burgundy px-4 py-2 text-xs font-medium text-burgundy transition hover:bg-burgundy hover:text-ivory"
          >
            Quick Add
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
