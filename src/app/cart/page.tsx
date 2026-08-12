"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Your cart is empty</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream transition hover:bg-ink/85"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-10 font-display text-4xl text-ink">Your Cart</h1>

      <div className="divide-y divide-border border-y border-border">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 py-5">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-cream-dark">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <Link
                href={`/product/${item.slug}`}
                className="font-medium text-ink hover:text-sage-dark"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-ink-soft">
                {formatPrice(item.unitPriceCents)} each
              </p>
            </div>
            <div className="flex items-center rounded-full border border-border">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="flex h-9 w-9 items-center justify-center text-ink-soft transition hover:text-ink"
                aria-label="Decrease quantity"
              >
                &minus;
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="flex h-9 w-9 items-center justify-center text-ink-soft transition hover:text-ink"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <p className="w-24 text-right font-medium text-ink">
              {formatPrice(item.unitPriceCents * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-ink-soft transition hover:text-terracotta-dark"
              aria-label={`Remove ${item.name}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-2">
        <div className="flex w-full max-w-xs justify-between text-sm text-ink-soft sm:w-64">
          <span>Subtotal</span>
          <span className="font-medium text-ink">{formatPrice(subtotalCents)}</span>
        </div>
        <p className="w-full max-w-xs text-right text-xs text-ink-soft sm:w-64">
          Shipping and taxes calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-4 w-full max-w-xs rounded-full bg-sage px-7 py-3 text-center text-sm font-semibold text-white transition hover:bg-sage-dark sm:w-64"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
