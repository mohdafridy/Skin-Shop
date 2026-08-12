"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export default function ProductInfo({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-walnut/70">{product.category}</p>
      <h1 className="mt-2 text-balance font-display text-3xl leading-tight text-ink sm:text-4xl">
        {product.name}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {typeof product.price === "number" && (
          <span className="text-xl font-medium text-ink">
            {formatPrice(product.price, product.currency)}
          </span>
        )}
        {product.size && (
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-walnut/70">
            {product.size}
          </span>
        )}
        {product.bestseller && (
          <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-walnut">
            Bestseller
          </span>
        )}
      </div>

      <p className="mt-5 text-balance leading-relaxed text-walnut/80">
        {product.shortDescription}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border border-gold/30">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-12 w-12 items-center justify-center text-lg text-ink transition hover:text-burgundy"
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-12 w-12 items-center justify-center text-lg text-ink transition hover:text-burgundy"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 rounded-full bg-burgundy px-8 py-3.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark sm:flex-none"
        >
          {added ? "Added to Bag" : "Add to Bag"}
        </button>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 rounded-full border border-ink px-8 py-3.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-ivory sm:flex-none"
        >
          Buy Now
        </button>
      </div>

      {/* Sticky mobile add-to-bag */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gold/20 bg-ivory/95 p-4 backdrop-blur-sm lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{product.shortName ?? product.name}</p>
          {typeof product.price === "number" && (
            <p className="text-xs text-walnut/70">{formatPrice(product.price, product.currency)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-shrink-0 rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
        >
          {added ? "Added" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}
