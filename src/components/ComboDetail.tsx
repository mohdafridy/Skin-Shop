"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Combo } from "@/data/combos";
import { getComboPricing } from "@/data/combos";
import { getProductBySlug } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import ReviewsSection from "./ReviewsSection";
import SmartImage from "./SmartImage";

export default function ComboDetail({ combo }: { combo: Combo }) {
  const { addCombo } = useCart();
  const router = useRouter();
  const comboProducts = combo.productSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const { individualValue, price, savings, currency } = getComboPricing(combo);

  function handleBuyNow() {
    router.push(`/checkout?mode=buynow&type=combo&slug=${combo.slug}&qty=1`);
  }

  return (
    <article id={combo.slug} className="grid gap-10 border-b border-gold/25 pb-14 scroll-mt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 xl:gap-24">
      <SmartImage
        src={combo.image}
        alt={`${combo.name} — ${combo.mood}`}
        label={combo.name}
        className="aspect-[4/3]"
        sizes="(min-width: 1024px) 48vw, 90vw"
        imageClassName="transition-transform duration-[850ms] ease-premium hover:scale-[1.018]"
      />

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-gold/80" aria-hidden="true" />
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.17em] text-burgundy">Curated ritual</p>
        </div>
        <h3 className="mt-4 text-balance font-display text-[clamp(3rem,5vw,5rem)] font-normal leading-[0.9] tracking-[-0.05em] text-ink">{combo.name}</h3>
        <p className="mt-5 text-[0.66rem] font-semibold uppercase tracking-[0.13em] text-walnut/45">{combo.mood}</p>
        <p className="mt-5 max-w-xl text-balance text-[0.96rem] leading-[1.82] text-walnut/68">{combo.description}</p>

        <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-gold/20 py-4">
          <span className="font-display text-[1.8rem] tracking-[-0.02em] text-ink">{formatPrice(price, currency)}</span>
          {savings > 0 && (
            <>
              <span className="text-sm text-walnut/42 line-through">{formatPrice(individualValue, currency)}</span>
              <span className="text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-olive">Save {formatPrice(savings, currency)}</span>
            </>
          )}
        </div>

        <ul className="mt-6 divide-y divide-gold/15 border-b border-gold/15">
          {comboProducts.map((product, index) => (
            <li key={product.slug} className="flex items-center justify-between gap-4 py-3 text-sm">
              <Link href={`/products/${product.slug}`} className="group flex min-w-0 items-baseline gap-3 text-walnut/70 transition-colors hover:text-burgundy">
                <span className="text-[0.6rem] font-semibold tracking-[0.12em] text-gold/75">{String(index + 1).padStart(2, "0")}</span>
                <span className="truncate">{product.shortName ?? product.name}</span>
              </Link>
              <span className="flex-shrink-0 text-xs text-walnut/45">{formatPrice(product.price, product.currency)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => addCombo(combo)} className="premium-button premium-button-primary flex-1 sm:flex-none">Add The Ritual</button>
          <button type="button" onClick={handleBuyNow} className="premium-button premium-button-secondary flex-1 sm:flex-none">Buy Now</button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <ReviewsSection type="combo" slug={combo.slug} subjectName={combo.name} />
      </div>
    </article>
  );
}
