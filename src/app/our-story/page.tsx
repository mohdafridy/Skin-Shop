import type { Metadata } from "next";
import SmartImage from "@/components/SmartImage";
import SectionDivider from "@/components/SectionDivider";
import Reveal from "@/components/Reveal";
import { brandLine, founderName, founderQuote, brandPillars } from "@/data/navigation";
import { HUSN_E_YUSUF, ARK_E_GULAAB } from "@/lib/proper-nouns";
import { canonical } from "@/lib/seo";

const philosophyPoints = [
  "Raw and organic botanical ingredients",
  "Traditional Kashmiri skincare knowledge",
  "Modern formulation techniques",
  "Plant-based, cruelty-free formulations",
  "Formulas refined over several years",
];

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "The Skin Shop was created to bring ingredients and rituals that feel familiar, treasured and timeless into the way people care for themselves today.",
  alternates: canonical("/our-story"),
};

const transformations = [
  `Rose becomes ${ARK_E_GULAAB}.`,
  "Saffron becomes an indulgent gel ritual.",
  "Rosemary enters modern hair care.",
  `${HUSN_E_YUSUF} becomes part of cleansing and exfoliation.`,
];

export default function OurStoryPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-6 pt-16 text-center sm:px-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
          Our Story
        </p>
        <h1 className="text-balance font-display text-4xl leading-tight text-ink sm:text-5xl">
          Beauty With A Sense Of Place
        </h1>
      </div>

      <Reveal className="mx-auto mt-14 max-w-4xl px-6 sm:px-8">
        <SmartImage
          src="/images/kashmir/our-story.jpg"
          alt="Kashmir, the place The Skin Shop's rituals and ingredients come from"
          label="Beauty with a sense of place"
          className="aspect-[16/9] rounded-2xl"
          sizes="(min-width: 1024px) 60vw, 90vw"
        />
      </Reveal>

      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8 lg:py-20">
        <Reveal>
          <p className="text-balance text-lg leading-relaxed text-walnut/85">
            The Skin Shop was created around a simple idea: bring ingredients and
            rituals that feel familiar, treasured and timeless into the way people
            care for themselves today.
          </p>
          <p className="mt-6 text-balance text-lg leading-relaxed text-walnut/85">
            Across the collection, botanical traditions meet contemporary skincare
            formats.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <ul className="mt-10 space-y-4 border-y border-gold/20 py-8">
            {transformations.map((line) => (
              <li
                key={line}
                className="text-balance font-display text-xl text-ink sm:text-2xl"
              >
                {line}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-10 text-balance text-lg leading-relaxed text-walnut/85">
            The point is not to make tradition look old. It is to let heritage feel
            relevant again.
          </p>
          <p className="mt-6 text-balance text-lg leading-relaxed text-walnut/85">
            The Skin Shop believes regional identity should not be hidden in order to
            feel premium. It should become part of the reason the brand is
            remembered.
          </p>
        </Reveal>
      </div>

      <div className="bg-sand/50 py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-6 sm:px-8">
          <Reveal>
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
              What Goes Into Every Formula
            </p>
            <h2 className="text-balance text-center font-display text-2xl text-ink sm:text-3xl">
              Organic, Botanical, Result-Oriented
            </h2>
            <ul className="mx-auto mt-8 max-w-md space-y-3">
              {philosophyPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-walnut/80">
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  <span className="text-balance">{point}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2 text-center text-xs font-medium uppercase tracking-wide text-walnut/70">
              {brandPillars.map((pillar, i) => (
                <li key={pillar} className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-gold" aria-hidden="true">
                      ·
                    </span>
                  )}
                  {pillar}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:px-8 lg:py-20">
        <Reveal>
          <p className="text-balance font-display text-2xl leading-snug text-ink sm:text-3xl">
            &ldquo;{founderQuote}&rdquo;
          </p>
          <p className="mt-4 text-sm text-walnut/60">— {founderName}, Founder</p>
        </Reveal>
      </div>

      <div className="pb-8">
        <SectionDivider />
      </div>

      <p className="px-6 pb-24 pt-8 text-center font-display text-3xl text-ink sm:text-4xl">
        {brandLine}
      </p>
    </div>
  );
}
