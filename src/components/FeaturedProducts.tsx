"use client";

import { useRef } from "react";
import Link from "next/link";
import { products, type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useAddedFeedback } from "@/lib/use-added-feedback";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";

function BestsellerCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, triggerAdded] = useAddedFeedback();

  return (
    <div className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-md"
        aria-label={`View ${product.name}`}
      >
        <SmartImage
          src={product.image}
          alt={product.name}
          label={product.shortName ?? product.name}
          className="aspect-square"
          sizes="(min-width: 1024px) 22vw, 44vw"
          imageClassName="transition-transform duration-[450ms] ease-premium group-hover:scale-[1.03]"
        />
      </Link>
      <Link href={`/products/${product.slug}`} className="mt-4">
        <h3 className="text-balance font-display text-base font-semibold leading-[1.2] tracking-tight text-ink transition-colors duration-[200ms] ease-premium group-hover:text-burgundy">
          {product.shortName ?? product.name}
        </h3>
      </Link>
      <p className="mt-1 text-sm font-medium text-ink">{formatPrice(product.price, product.currency)}</p>
      <button
        type="button"
        onClick={() => {
          addItem(product);
          triggerAdded();
        }}
        className="mt-3 w-full rounded-full bg-ink px-5 py-2.5 text-xs font-medium text-ivory transition-[background-color,transform] duration-[200ms] ease-premium hover:bg-burgundy active:scale-[0.98]"
      >
        {added ? "Added ✓" : "Add to Bag"}
      </button>
    </div>
  );
}

export default function FeaturedProducts() {
  const featured = products.filter((p) => p.featured);
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(direction: 1 | -1) {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-standard px-6 py-[var(--space-section-md)] sm:px-8">
      <div className="grid min-w-0 gap-10 lg:grid-cols-[1fr_2.3fr] lg:items-end lg:gap-10">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">Our Bestsellers</p>
          <h2 className="mt-3 text-balance font-display text-3xl leading-tight text-ink sm:text-4xl">
            Discover what your skin will love
          </h2>
          <p className="mt-4 max-w-xs text-balance text-walnut/75">
            Handpicked favorites from our botanical collections.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-burgundy hover:underline"
          >
            View all products
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="min-w-0">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featured.map((product, i) => (
              <Reveal
                key={product.slug}
                delay={i * 60}
                className="w-[46%] flex-shrink-0 snap-start sm:w-[31%] lg:w-[24%]"
              >
                <BestsellerCard product={product} />
              </Reveal>
            ))}
          </div>

          <div className="mt-6 hidden justify-end gap-3 sm:flex">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              aria-label="Previous products"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-ink transition hover:border-burgundy hover:text-burgundy"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 6-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              aria-label="Next products"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-ink transition hover:border-burgundy hover:text-burgundy"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
