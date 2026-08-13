"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Combo } from "@/data/combos";
import { getComboPricing } from "@/data/combos";
import { getProductBySlug } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
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
    <div
      id={combo.slug}
      className="grid gap-10 rounded-3xl border border-gold/20 bg-white/40 p-6 scroll-mt-28 sm:p-10 lg:grid-cols-2 lg:gap-14"
    >
      <SmartImage
        src={combo.image}
        alt={`${combo.name} — ${combo.mood}`}
        label={combo.name}
        className="aspect-[4/5] rounded-2xl"
        sizes="(min-width: 1024px) 40vw, 90vw"
      />

      <div className="flex flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
          {combo.mood}
        </p>
        <h3 className="mt-3 text-balance font-display text-3xl text-ink">{combo.name}</h3>
        <p className="mt-3 text-balance leading-relaxed text-walnut/80">{combo.description}</p>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-medium text-ink">{formatPrice(price, currency)}</span>
          {savings > 0 && (
            <>
              <span className="text-base text-walnut/50 line-through">
                {formatPrice(individualValue, currency)}
              </span>
              <span className="rounded-full bg-olive/15 px-3 py-1 text-xs font-medium text-olive">
                Save {formatPrice(savings, currency)}
              </span>
            </>
          )}
        </div>

        <ul className="mt-6 space-y-2">
          {comboProducts.map((product) => (
            <li key={product.slug} className="flex items-center justify-between gap-3 text-sm">
              <Link
                href={`/products/${product.slug}`}
                className="text-walnut/80 underline-offset-4 transition hover:text-burgundy hover:underline"
              >
                {product.shortName ?? product.name}
              </Link>
              <span className="flex-shrink-0 text-walnut/50">
                {formatPrice(product.price, product.currency)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => addCombo(combo)}
            className="flex-1 rounded-full bg-burgundy px-7 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark sm:flex-none"
          >
            Add The Ritual
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 rounded-full border border-ink px-7 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-ivory sm:flex-none"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
