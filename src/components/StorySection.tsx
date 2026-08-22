import Link from "next/link";
import SmartImage from "./SmartImage";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import SectionDivider from "./SectionDivider";

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
    <section className="chapter-section bg-ivory py-[var(--space-section-lg)]">
      <div className="mx-auto max-w-wide px-6 sm:px-8">
        <div
          className={`grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20 xl:gap-28 ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <Reveal variant="image" className="overflow-hidden">
            <SmartImage
              src={image}
              alt={imageLabel}
              label={imageLabel}
              className="aspect-[5/4]"
              sizes="(min-width: 1024px) 52vw, 92vw"
              imageClassName="transition-transform duration-[900ms] ease-premium hover:scale-[1.018]"
            />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading eyebrow={eyebrow} title={title} size="large" />
            <div className="mt-6 max-w-xl space-y-4">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="text-balance text-[0.98rem] leading-[1.85] text-walnut/68">
                  {paragraph}
                </p>
              ))}
            </div>
            {cta && (
              <Link href={cta.href} className="editorial-link mt-7 text-burgundy">
                {cta.label} <span aria-hidden="true">→</span>
              </Link>
            )}
          </Reveal>
        </div>
      </div>
      <div className="mt-[var(--space-section-lg)]">
        <SectionDivider />
      </div>
    </section>
  );
}
