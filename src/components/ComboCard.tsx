"use client";

import Link from "next/link";
import type { Combo } from "@/data/combos";
import { getComboPricing } from "@/data/combos";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import SmartImage from "./SmartImage";

export default function ComboCard({ combo }: { combo: Combo }) {
  const { addCombo } = useCart();
  const { individualValue, price, savings, currency } = getComboPricing(combo);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-white/40 transition hover:-translate-y-1">
      <Link href={`/rituals#${combo.slug}`} className="block overflow-hidden">
        <SmartImage
          src={combo.image}
          alt={`${combo.name} — ${combo.mood}`}
          label={combo.name}
          className="aspect-[4/5]"
          sizes="(min-width: 1024px) 30vw, 90vw"
          imageClassName="transition duration-700 ease-out group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <Link href={`/rituals#${combo.slug}`}>
          <h3 className="text-balance font-display text-xl text-ink transition group-hover:text-burgundy">
            {combo.name}
          </h3>
        </Link>
        <p className="mt-2 text-balance text-sm leading-relaxed text-walnut/75">
          {combo.tagline}
        </p>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-medium text-ink">{formatPrice(price, currency)}</span>
          {savings > 0 && (
            <>
              <span className="text-sm text-walnut/50 line-through">
                {formatPrice(individualValue, currency)}
              </span>
              <span className="rounded-full bg-olive/15 px-2.5 py-0.5 text-xs font-medium text-olive">
                Save {formatPrice(savings, currency)}
              </span>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => addCombo(combo)}
            className="rounded-full bg-burgundy px-4 py-2 text-xs font-medium text-ivory transition hover:bg-burgundy-dark"
          >
            Add The Ritual
          </button>
          <Link
            href={`/rituals#${combo.slug}`}
            className="text-xs font-medium text-walnut/70 underline-offset-2 transition hover:text-burgundy hover:underline"
          >
            View Ritual
          </Link>
        </div>
      </div>
    </div>
  );
}
