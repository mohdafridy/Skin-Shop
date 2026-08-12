"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.image_url,
        unitPriceCents: product.price_cents,
      },
      quantity,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-border">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center text-lg text-ink-soft transition hover:text-ink"
          aria-label="Decrease quantity"
        >
          &minus;
        </button>
        <span className="w-6 text-center text-sm font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="flex h-11 w-11 items-center justify-center text-lg text-ink-soft transition hover:text-ink"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!product.in_stock}
        className="flex-1 rounded-full bg-sage px-6 py-3 text-sm font-semibold text-white transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:bg-ink-soft/40"
      >
        {!product.in_stock ? "Sold out" : justAdded ? "Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}
