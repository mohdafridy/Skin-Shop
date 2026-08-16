import { combos } from "@/data/combos";
import SectionHeading from "./SectionHeading";
import ComboCard from "./ComboCard";
import Reveal from "./Reveal";

export default function CuratedRituals() {
  return (
    <section className="bg-walnut py-[var(--space-section-lg)]">
      <div className="mx-auto max-w-standard px-6 sm:px-8">
        <SectionHeading
          eyebrow="Together"
          title="Curated Rituals"
          subtitle="Three ways to experience The Skin Shop together."
          center
          light
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
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
