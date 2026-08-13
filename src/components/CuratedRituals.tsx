import { combos } from "@/data/combos";
import SectionHeading from "./SectionHeading";
import ComboCard from "./ComboCard";
import Reveal from "./Reveal";

export default function CuratedRituals() {
  return (
    <section className="bg-walnut py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <SectionHeading
          eyebrow="Together"
          title="Curated Rituals"
          subtitle="Three ways to experience The Skin Shop together."
          center
          light
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {combos.map((combo, i) => (
            <Reveal key={combo.slug} delay={i * 90}>
              <ComboCard combo={combo} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
