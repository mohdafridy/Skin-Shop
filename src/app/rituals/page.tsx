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
      <div className="mx-auto max-w-3xl px-6 pt-16 text-center sm:px-8">
        <SectionHeading
          eyebrow="Rituals"
          title="Curated Rituals"
          subtitle="Three ways to experience The Skin Shop together, and seven ways to shop by what your routine needs."
          center
        />
      </div>

      <div className="mt-14">
        <ShopByRitual />
      </div>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:py-24">
        <div className="space-y-10">
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
