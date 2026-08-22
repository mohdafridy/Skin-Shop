import type { Metadata } from "next";
import { combos } from "@/data/combos";
import ShopByRitual from "@/components/ShopByRitual";
import ComboDetail from "@/components/ComboDetail";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Rituals",
  description:
    "Find your ritual — shop by cleanse, treat, hydrate and more, or explore The Skin Shop's curated combos.",
  alternates: canonical("/rituals"),
};

export default function RitualsPage() {
  return (
    <div>
      <div className="mx-auto max-w-standard px-6 pt-16 sm:px-8 lg:pt-20">
        <SectionHeading
          eyebrow="Rituals"
          title="Curated Rituals"
          subtitle="Three ways to experience The Skin Shop together, and seven ways to shop by what your routine needs."
          size="large"
        />
      </div>

      <div className="mt-16">
        <ShopByRitual />
      </div>

      <section className="mx-auto max-w-standard px-6 py-[var(--space-section-md)] sm:px-8">
        <div className="space-y-16 lg:space-y-24">
          {combos.map((combo, i) => (
            <Reveal key={combo.slug} delay={i * 80}>
              <ComboDetail combo={combo} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
