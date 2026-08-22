import Link from "next/link";
import type { Product } from "@/data/products";
import { getProductBySlug } from "@/data/products";

type Stage = {
  label: string;
  matches: (product: Product) => boolean;
};

const stages: Stage[] = [
  { label: "Cleanse", matches: (p) => Boolean(p.ritualTags?.includes("Cleanse")) },
  { label: "Treat", matches: (p) => Boolean(p.ritualTags?.includes("Treat") || p.ritualTags?.includes("Exfoliate")) },
  { label: "Nourish", matches: (p) => Boolean(p.ritualTags?.includes("Hydrate")) },
  { label: "Complete", matches: (p) => p.collection === "Lip Care" || p.collection === "Body" || p.collection === "Hair" || p.collection === "Kids" },
];

export default function RitualTimeline({ product }: { product: Product }) {
  const pool = [
    product,
    ...(product.related ?? []).map(getProductBySlug).filter((item) => item != null),
  ];
  const used = new Set<string>();

  const stageProducts = stages.map((stage) => {
    const candidate = pool.find((item) => !used.has(item.slug) && stage.matches(item));
    if (candidate) used.add(candidate.slug);
    return candidate;
  });

  const currentStage = stages.findIndex((stage) => stage.matches(product));

  return (
    <section className="mt-10 border-y border-gold/20 py-7" aria-label="Ritual placement">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-burgundy">Ritual placement</p>
          <h2 className="mt-2 font-display text-[2rem] leading-none tracking-[-0.03em] text-ink">Where it can sit in your routine</h2>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-relaxed text-walnut/48 sm:block">
          A simple discovery pathway based on product categories, not a prescribed routine.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {stages.map((stage, index) => {
          const stageProduct = stageProducts[index];
          const active = index === currentStage;
          return (
            <div key={stage.label} className="relative border-t border-gold/25 pt-4">
              <span
                aria-hidden="true"
                className={`absolute -top-[3px] left-0 h-[5px] w-[5px] rotate-45 border ${active ? "border-burgundy bg-burgundy" : "border-gold/60 bg-ivory"}`}
              />
              <p className={`text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${active ? "text-burgundy" : "text-walnut/42"}`}>
                {String(index + 1).padStart(2, "0")} · {stage.label}
              </p>
              {stageProduct ? (
                <Link
                  href={`/products/${stageProduct.slug}`}
                  className="mt-2 block font-display text-[1.2rem] leading-[1.05] tracking-[-0.02em] text-ink transition-colors hover:text-burgundy"
                >
                  {stageProduct.shortName ?? stageProduct.name}
                  {stageProduct.slug === product.slug && <span className="ml-1 text-xs font-sans text-burgundy">current</span>}
                </Link>
              ) : (
                <p className="mt-2 text-xs text-walnut/38">Open step</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
