"use client";

import Link from "next/link";
import type { Combo } from "@/data/combos";
import { getComboPricing } from "@/data/combos";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { useAddedFeedback } from "@/lib/use-added-feedback";
import { ritualHoverTreatment, defaultRitualTreatment } from "@/lib/ritual-treatment";
import SmartImage from "./SmartImage";

export default function ComboCard({ combo }: { combo: Combo }) {
  const { addCombo } = useCart();
  const [added, triggerAdded] = useAddedFeedback();
  const { individualValue, price, savings, currency } = getComboPricing(combo);
  const treatment = ritualHoverTreatment[combo.id] ?? defaultRitualTreatment;

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/rituals#${combo.slug}`} className="relative block overflow-hidden bg-ink/20">
        <SmartImage
          src={combo.image}
          alt={`${combo.name} — ${combo.mood}`}
          label={combo.name}
          className="aspect-[4/3]"
          sizes="(min-width: 1024px) 30vw, 90vw"
          imageClassName={`transition-transform duration-[750ms] ease-premium ${treatment.scale}`}
        />
        {treatment.overlay && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-premium ${treatment.overlay}`}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/35 to-transparent opacity-70" />
        <div className="editorial-hover-overlay pointer-events-none absolute bottom-5 left-5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ivory/90">
          View ritual <span className="ml-1">→</span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-5 text-ivory">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-gold/85">Curated ritual</p>
        <Link href={`/rituals#${combo.slug}`} className="mt-1.5 block">
          <h3 className="text-balance font-display text-[1.8rem] font-normal leading-none tracking-[-0.03em] text-ivory transition-colors duration-200 ease-premium group-hover:text-sand sm:text-[2rem]">
            {combo.name}
          </h3>
        </Link>
        <p className="mt-3 text-balance text-sm leading-[1.65] text-ivory/62">{combo.tagline}</p>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-gold/20 pt-4">
          <span className="text-base font-medium text-ivory">{formatPrice(price, currency)}</span>
          {savings > 0 && (
            <>
              <span className="text-xs text-ivory/42 line-through">{formatPrice(individualValue, currency)}</span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gold">
                Save {formatPrice(savings, currency)}
              </span>
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              addCombo(combo);
              triggerAdded();
            }}
            className="editorial-link text-ivory"
          >
            {added ? "Added ✓" : "Add the ritual"}
            <span aria-hidden="true">+</span>
          </button>
          <Link
            href={`/rituals#${combo.slug}`}
            className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-ivory/55 transition-colors hover:text-gold"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
