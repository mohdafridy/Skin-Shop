import { combos } from "@/data/combos";
import SectionHeading from "./SectionHeading";
import ComboCard from "./ComboCard";
import Reveal from "./Reveal";

export default function CuratedRituals() {
  return (
    <section className="chapter-section bg-walnut py-[var(--space-section-lg)]">
      <div className="mx-auto max-w-standard px-6 sm:px-8">
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="Together"
            title="The Art of Pairing"
            subtitle="Skincare companions selected to work beautifully together, whatever kind of care your skin needs today."
            light
            size="large"
          />
        </div>
        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-7 lg:gap-10">
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
