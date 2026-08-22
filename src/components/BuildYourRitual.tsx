"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getProductBySlug } from "@/data/products";
import { getComboBySlug, getComboPricing } from "@/data/combos";
import { formatPrice } from "@/lib/format";
import SmartImage from "./SmartImage";
import SectionHeading from "./SectionHeading";

type Goal = "fresh" | "glow" | "evening" | "reset" | "beyond" | "essentials";
type Time = "morning" | "evening" | "anytime";
type Depth = "one" | "simple" | "full";

const goals: { id: Goal; label: string; note: string }[] = [
  { id: "fresh", label: "A fresh start", note: "Cleanse and reset" },
  { id: "glow", label: "A little glow", note: "Brightening care" },
  { id: "evening", label: "A slow evening", note: "Night-time nourishment" },
  { id: "reset", label: "A weekly reset", note: "Mask and exfoliation" },
  { id: "beyond", label: "Care beyond the face", note: "Hair and body" },
  { id: "essentials", label: "Everyday essentials", note: "Family and lip care" },
];

const timeOptions: { id: Time; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "evening", label: "Evening" },
  { id: "anytime", label: "Whenever it fits" },
];

const depthOptions: { id: Depth; label: string; note: string }[] = [
  { id: "one", label: "One beautiful step", note: "Keep it minimal" },
  { id: "simple", label: "Two or three steps", note: "A simple ritual" },
  { id: "full", label: "A fuller ritual", note: "Take a little more time" },
];

function recommendations(goal: Goal, depth: Depth, time: Time) {
  const productMap: Record<Goal, string[]> = {
    fresh: ["husn-e-yusuf-whitening-soap-cleanser", "ark-e-gulaab"],
    glow: time === "evening"
      ? ["dahab-whitening-night-cream", "ark-e-gulaab"]
      : ["vitamin-c-serum", "ark-e-gulaab"],
    evening: ["dahab-whitening-night-cream", "husn-e-yusuf-whitening-soap-cleanser"],
    reset: ["coffee-detox-facemask", "husn-e-yusuf-exfoliator"],
    beyond: time === "evening"
      ? ["argan-body-whitening-cream", "rosemary-hair-serum"]
      : ["rosemary-hair-serum", "argan-body-whitening-cream"],
    essentials: time === "evening"
      ? ["shea-lip-balm", "jojoba-kids-soap"]
      : ["jojoba-kids-soap", "shea-lip-balm"],
  };

  const fullCombo: Partial<Record<Goal, string>> = {
    fresh: "radiance-ritual-combo",
    glow: "snowglow-combo",
    evening: "moonlight-combo",
    reset: "radiance-ritual-combo",
  };

  if (depth === "full" && fullCombo[goal]) {
    return { comboSlug: fullCombo[goal], productSlugs: [] as string[] };
  }

  return {
    comboSlug: undefined,
    productSlugs: depth === "one" ? productMap[goal].slice(0, 1) : productMap[goal],
  };
}

export default function BuildYourRitual() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [time, setTime] = useState<Time | null>(null);
  const [depth, setDepth] = useState<Depth | null>(null);

  const result = useMemo(() => {
    if (!goal || !time || !depth) return null;
    const rec = recommendations(goal, depth, time);
    const combo = rec.comboSlug ? getComboBySlug(rec.comboSlug) : undefined;
    const products = rec.productSlugs.map(getProductBySlug).filter((p) => p != null);
    return { combo, products };
  }, [goal, time, depth]);

  function restart() {
    setStep(1);
    setGoal(null);
    setTime(null);
    setDepth(null);
  }

  return (
    <section className="chapter-section bg-ivory py-[var(--space-section-lg)]">
      <div className="mx-auto max-w-standard px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Build Your Ritual"
              title="A Quieter Way to Discover"
              subtitle="Three short choices. No skin diagnosis, no complicated quiz — just a more thoughtful route into the collection."
              size="large"
            />
            <div className="mt-8 flex items-center gap-2 text-gold/70" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`h-px transition-all duration-300 ${step >= n ? "w-10 bg-burgundy" : "w-6 bg-gold/30"}`} />
              ))}
            </div>
          </div>

          <div className="border-y border-gold/20 py-8 sm:py-10">
            {!result ? (
              <>
                {step === 1 && (
                  <div className="editorial-line-in">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-burgundy">01 / What are you looking for?</p>
                    <div className="mt-6 grid gap-x-8 sm:grid-cols-2">
                      {goals.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setGoal(option.id);
                            setStep(2);
                          }}
                          className="group flex items-center justify-between border-b border-gold/20 py-4 text-left transition-colors hover:border-burgundy/45"
                        >
                          <span>
                            <span className="block font-display text-[1.45rem] leading-none tracking-[-0.02em] text-ink group-hover:text-burgundy">{option.label}</span>
                            <span className="mt-1.5 block text-xs text-walnut/55">{option.note}</span>
                          </span>
                          <span className="text-gold transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="editorial-line-in">
                    <button type="button" onClick={() => setStep(1)} className="mb-6 text-xs font-medium text-walnut/55 hover:text-burgundy">← Back</button>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-burgundy">02 / When do you prefer your ritual?</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {timeOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setTime(option.id);
                            setStep(3);
                          }}
                          className="min-h-24 border border-gold/25 px-5 py-5 text-left font-display text-[1.35rem] leading-none tracking-[-0.02em] text-ink transition-[border-color,color,transform] duration-200 hover:-translate-y-px hover:border-burgundy hover:text-burgundy"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="editorial-line-in">
                    <button type="button" onClick={() => setStep(2)} className="mb-6 text-xs font-medium text-walnut/55 hover:text-burgundy">← Back</button>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-burgundy">03 / How simple should it be?</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {depthOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setDepth(option.id)}
                          className="group min-h-32 border border-gold/25 px-5 py-5 text-left transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-burgundy"
                        >
                          <span className="block font-display text-[1.35rem] leading-none tracking-[-0.02em] text-ink group-hover:text-burgundy">{option.label}</span>
                          <span className="mt-2 block text-xs leading-relaxed text-walnut/55">{option.note}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="editorial-line-in">
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-burgundy">Your starting point</p>
                    <h3 className="mt-2 font-display text-4xl leading-none tracking-[-0.035em] text-ink">A ritual that fits your pace.</h3>
                  </div>
                  <button type="button" onClick={restart} className="text-xs font-semibold uppercase tracking-[0.1em] text-walnut/55 hover:text-burgundy">Start again</button>
                </div>

                {result.combo ? (
                  <div className="mt-8 grid gap-6 border-t border-gold/20 pt-6 sm:grid-cols-[150px_1fr] sm:items-center">
                    <SmartImage src={result.combo.image} alt={result.combo.name} label={result.combo.name} className="aspect-[4/3]" sizes="150px" />
                    <div>
                      <p className="font-display text-3xl leading-none tracking-[-0.03em] text-ink">{result.combo.name}</p>
                      <p className="mt-3 max-w-lg text-sm leading-[1.7] text-walnut/65">{result.combo.description}</p>
                      <p className="mt-3 text-sm font-medium text-ink">{formatPrice(getComboPricing(result.combo).price, result.combo.currency)}</p>
                      <Link href={`/rituals#${result.combo.slug}`} className="editorial-link mt-5 text-burgundy">See the ritual <span aria-hidden="true">→</span></Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 grid gap-6 border-t border-gold/20 pt-6 sm:grid-cols-2">
                    {result.products.map((product) => (
                      <Link key={product.slug} href={`/products/${product.slug}`} className="group grid grid-cols-[86px_1fr] items-center gap-4">
                        <SmartImage src={product.image} alt={product.name} label={product.shortName ?? product.name} className="aspect-[4/5]" sizes="86px" imageClassName="transition-transform duration-500 group-hover:scale-[1.025]" />
                        <div>
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-walnut/45">{product.category}</p>
                          <p className="mt-1 font-display text-[1.4rem] leading-none tracking-[-0.02em] text-ink group-hover:text-burgundy">{product.shortName ?? product.name}</p>
                          <p className="mt-2 text-xs text-walnut/65">{formatPrice(product.price, product.currency)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <p className="mt-7 text-xs leading-relaxed text-walnut/48">This discovery guide helps you browse the collection; it is not a skin diagnosis or a guarantee of results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
