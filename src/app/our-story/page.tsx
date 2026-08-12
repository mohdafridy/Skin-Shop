import type { Metadata } from "next";
import SmartImage from "@/components/SmartImage";
import SectionDivider from "@/components/SectionDivider";
import Reveal from "@/components/Reveal";
import { brandLine } from "@/data/navigation";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "The Skin Shop was created to bring ingredients and rituals that feel familiar, treasured and timeless into the way people care for themselves today.",
};

const transformations = [
  "Rose becomes Ark e Gulaab.",
  "Saffron becomes an indulgent gel ritual.",
  "Rosemary enters modern hair care.",
  "Husn e Yusuf becomes part of cleansing and exfoliation.",
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

      <div className="pb-8">
        <SectionDivider />
      </div>

      <p className="px-6 pb-24 pt-8 text-center font-display text-3xl text-ink sm:text-4xl">
        {brandLine}
      </p>
    </div>
  );
}
