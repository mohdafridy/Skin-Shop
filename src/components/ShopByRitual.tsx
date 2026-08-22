import Link from "next/link";
import { ritualCategories } from "@/data/rituals";
import { getProductBySlug } from "@/data/products";
import SectionHeading from "./SectionHeading";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";

export default function ShopByRitual() {
  return (
    <section className="chapter-section bg-sand/32 py-[var(--space-section-lg)]">
      <div className="mx-auto max-w-standard px-6 sm:px-8">
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionHeading
            eyebrow="Shop By Need"
            title="Find Your Kind of Care"
            subtitle="Explore skincare by what you want more of — hydration, radiance, nourishment, clarity or calm."
            size="large"
          />
          <p className="max-w-md justify-self-end text-sm leading-[1.8] text-walnut/58 lg:text-right">
            Begin with the feeling you want from your routine. Each pathway leads only to existing products in the collection.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-11 sm:grid-cols-3 sm:gap-x-7 lg:gap-x-9">
          {ritualCategories.map((ritual, i) => {
            const product = getProductBySlug(ritual.representativeSlug);
            return (
              <Reveal key={ritual.name} delay={(i % 4) * 60}>
                <Link
                  href={`/shop?ritual=${encodeURIComponent(ritual.filterValues.join(","))}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden bg-sand">
                    <SmartImage
                      src={product?.image ?? ""}
                      alt={ritual.name}
                      label={ritual.name}
                      className="aspect-[4/3]"
                      sizes="(min-width: 640px) 30vw, 45vw"
                      imageClassName="transition-transform duration-[700ms] ease-premium group-hover:scale-[1.028]"
                    />
                    <div className="editorial-hover-overlay pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/45 to-transparent px-4 pb-4 pt-12 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ivory">
                      Explore pathway →
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gold/20 pt-3">
                    <h3 className="font-display text-[1.5rem] leading-none tracking-[-0.025em] text-ink transition-colors duration-200 group-hover:text-burgundy sm:text-[1.65rem]">
                      {ritual.name}
                    </h3>
                    <p className="mt-2 text-balance text-xs leading-[1.65] text-walnut/62">
                      {ritual.description}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
