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
    <div className="group flex flex-col overflow-hidden rounded-md border border-gold/15 bg-white/40 transition-[transform,box-shadow] duration-[280ms] ease-premium hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(42,32,28,0.1)]">
      <Link href={`/rituals#${combo.slug}`} className="relative block overflow-hidden">
        <SmartImage
          src={combo.image}
          alt={`${combo.name} — ${combo.mood}`}
          label={combo.name}
          className="aspect-[4/5]"
          sizes="(min-width: 1024px) 30vw, 90vw"
          imageClassName={`transition-transform duration-[500ms] ease-premium ${treatment.scale}`}
        />
        {treatment.overlay && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ease-premium ${treatment.overlay}`}
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <Link href={`/rituals#${combo.slug}`}>
          <h3 className="text-balance font-display text-2xl font-semibold leading-[1.2] tracking-tight text-ink transition-colors duration-[200ms] ease-premium group-hover:text-burgundy">
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
            onClick={() => {
              addCombo(combo);
              triggerAdded();
            }}
            className="rounded-full bg-burgundy px-4 py-2 text-xs font-medium text-ivory transition-[background-color,transform] duration-[200ms] ease-premium hover:bg-burgundy-dark active:scale-95"
          >
            {added ? "Added ✓" : "Add The Ritual"}
          </button>
          <Link
            href={`/rituals#${combo.slug}`}
            className="text-xs font-medium text-walnut/70 underline-offset-2 transition-colors duration-[200ms] ease-premium hover:text-burgundy hover:underline"
          >
            View Ritual
          </Link>
        </div>
      </div>
    </div>
  );
}
