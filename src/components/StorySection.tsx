import Link from "next/link";
import SmartImage from "./SmartImage";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

type StorySectionProps = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  image: string;
  imageLabel: string;
  cta?: { label: string; href: string };
  reverse?: boolean;
};

export default function StorySection({
  eyebrow,
  title,
  paragraphs,
  image,
  imageLabel,
  cta,
  reverse = false,
}: StorySectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
      <div
        className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <Reveal>
          <SmartImage
            src={image}
            alt={imageLabel}
            label={imageLabel}
            className="aspect-[5/4] rounded-2xl"
            sizes="(min-width: 1024px) 45vw, 90vw"
          />
        </Reveal>
        <Reveal delay={100}>
          <SectionHeading eyebrow={eyebrow} title={title} />
          <div className="mt-5 space-y-4">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-balance leading-relaxed text-walnut/80">
                {paragraph}
              </p>
            ))}
          </div>
          {cta && (
            <Link
              href={cta.href}
              className="mt-7 inline-block rounded-full bg-burgundy px-7 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
            >
              {cta.label}
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
