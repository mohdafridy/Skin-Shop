"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/analytics";
import { useAddedFeedback } from "@/lib/use-added-feedback";
import { useProductReviews } from "@/lib/reviews-client";
import { StarRow } from "./reviews/RatingStars";
import { HeartIcon } from "./icons";
import ConsultationCTA from "./ConsultationCTA";

export default function ProductInfo({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.slug);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, triggerAdded] = useAddedFeedback();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const reviewData = useProductReviews("product", product.slug);

  function handleReviewsClick(e: React.MouseEvent) {
    e.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(`reviews-${product.slug}`)
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

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
    triggerAdded();
  }

  function handleBuyNow() {
    router.push(`/checkout?mode=buynow&type=product&slug=${product.slug}&qty=${quantity}`);
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-px w-7 bg-gold/75" aria-hidden="true" />
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-burgundy">{product.category}</p>
      </div>

      <h1 className="mt-4 text-balance font-display text-[clamp(3rem,5.4vw,5.25rem)] font-normal leading-[0.9] tracking-[-0.055em] text-ink">
        {product.name}
      </h1>

      {reviewData && reviewData.count > 0 && (
        <a
          href={`#reviews-${product.slug}`}
          onClick={handleReviewsClick}
          className="mt-4 inline-flex items-center gap-2 text-xs text-walnut/58 transition-colors duration-150 ease-premium hover:text-burgundy"
        >
          <StarRow rating={reviewData.average ?? 0} size="h-3.5 w-3.5" />
          <span>
            {(reviewData.average ?? 0).toFixed(1)} · {reviewData.count} review{reviewData.count === 1 ? "" : "s"}
          </span>
        </a>
      )}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-5 border-y border-gold/20 py-4">
        <span className="font-display text-[1.7rem] tracking-[-0.02em] text-ink">
          {formatPrice(product.price, product.currency)}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-walnut/48">
          {product.size && <span>{product.size}</span>}
          {product.bestseller && <span className="text-gold">Bestseller</span>}
          {product.suitableFor && <span>For {product.suitableFor}</span>}
        </div>
      </div>

      <p className="mt-6 text-balance text-[0.98rem] leading-[1.82] text-walnut/68">
        {product.shortDescription}
      </p>

      {product.benefits && product.benefits.length > 0 && (
        <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {product.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-[0.82rem] leading-relaxed text-walnut/66">
              <span aria-hidden="true" className="mt-[0.48rem] h-1 w-1 flex-shrink-0 rotate-45 bg-gold" />
              <span className="text-balance">{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      <div ref={ctaRef} className="mt-9 border-t border-gold/20 pt-6">
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="flex min-h-[50px] items-center border border-walnut/25">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-full w-11 items-center justify-center text-lg text-ink transition-colors duration-150 ease-premium hover:text-burgundy active:scale-90"
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <span key={quantity} className="qty-pulse w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-full w-11 items-center justify-center text-lg text-ink transition-colors duration-150 ease-premium hover:text-burgundy active:scale-90"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button type="button" onClick={handleAdd} className="premium-button premium-button-primary flex-1 sm:flex-none sm:px-8">
            {added ? "Added ✓" : "Add to Bag"}
          </button>
          <button type="button" onClick={handleBuyNow} className="premium-button premium-button-secondary flex-1 sm:flex-none sm:px-8">
            Buy Now
          </button>
          <button
            type="button"
            onClick={() => toggle(product.slug)}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={wishlisted}
            className="flex min-h-[50px] w-[50px] flex-shrink-0 items-center justify-center border border-walnut/25 transition-colors hover:border-burgundy hover:text-burgundy"
          >
            <HeartIcon filled={wishlisted} className={`h-5 w-5 ${wishlisted ? "text-burgundy" : "text-ink"}`} />
          </button>
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-walnut/55">
        {["Cruelty-Free", "Handcrafted in Kashmir", "Ships Across India", "Secure Checkout"].map(
          (item, i) => (
            <li key={item} className="flex items-center gap-4">
              {i > 0 && (
                <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-gold/70" />
              )}
              {item}
            </li>
          ),
        )}
      </ul>

      <ConsultationCTA
        productSlug={product.slug}
        productName={product.name}
        price={product.price}
        currency={product.currency}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gold/20 bg-ivory/96 p-4 shadow-[0_-12px_35px_rgba(42,32,28,0.06)] backdrop-blur-sm transition-transform duration-300 ease-premium lg:hidden ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg leading-none text-ink">{product.shortName ?? product.name}</p>
          <p className="mt-1 text-xs text-walnut/60">{formatPrice(product.price, product.currency)}</p>
        </div>
        <button type="button" onClick={handleAdd} className="premium-button premium-button-primary min-h-[46px] px-5 py-2.5">
          {added ? "Added ✓" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}
