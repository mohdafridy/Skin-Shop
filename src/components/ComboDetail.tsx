"use client";

import Link from "next/link";
import type { Combo } from "@/data/combos";
import { getProductBySlug } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import SmartImage from "./SmartImage";

export default function ComboDetail({ combo }: { combo: Combo }) {
  const { addItem } = useCart();
  const comboProducts = combo.productSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  function handleAddAll() {
    comboProducts.forEach((product) => addItem(product));
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

        <ul className="mt-6 space-y-2">
          {comboProducts.map((product) => (
            <li key={product.slug}>
              <Link
                href={`/products/${product.slug}`}
                className="text-sm text-walnut/80 underline-offset-4 transition hover:text-burgundy hover:underline"
              >
                {product.shortName ?? product.name}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleAddAll}
          className="mt-8 w-fit rounded-full bg-burgundy px-7 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
        >
          Add Ritual To Bag
        </button>
      </div>
    </div>
  );
}
