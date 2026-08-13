"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/analytics";

export default function ProductInfo({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ctaRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    track({ name: "view_product", slug: product.slug, price: product.price, currency: product.currency });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    // Buy Now skips the cart entirely and goes straight to a checkout that's
    // scoped to just this product/quantity — the persistent cart (if the
    // shopper already has one) is left untouched.
    router.push(`/checkout?mode=buynow&type=product&slug=${product.slug}&qty=${quantity}`);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-walnut/70">{product.category}</p>
      <h1 className="mt-2 text-balance font-display text-3xl leading-tight text-ink sm:text-4xl">
        {product.name}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-xl font-medium text-ink">
          {formatPrice(product.price, product.currency)}
        </span>
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
        {product.suitableFor && (
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-walnut/70">
            For {product.suitableFor}
          </span>
        )}
      </div>

      <p className="mt-5 text-balance leading-relaxed text-walnut/80">
        {product.shortDescription}
      </p>

      {product.benefits && product.benefits.length > 0 && (
        <ul className="mt-5 space-y-2">
          {product.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5 text-sm text-walnut/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-olive"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
              </svg>
              <span className="text-balance">{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-4">
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
          onClick={handleBuyNow}
          className="flex-1 rounded-full border border-ink px-8 py-3.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-ivory sm:flex-none"
        >
          Buy Now
        </button>
      </div>

      {/* Sticky mobile add-to-bag — appears only once the main purchase
          controls above have scrolled out of view */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gold/20 bg-ivory/95 p-4 backdrop-blur-sm transition-transform duration-300 ease-out lg:hidden ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{product.shortName ?? product.name}</p>
          <p className="text-xs text-walnut/70">{formatPrice(product.price, product.currency)}</p>
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
