import SectionHeading from "./SectionHeading";
import SectionDivider from "./SectionDivider";
import Reveal from "./Reveal";

export default function CustomerExperience() {
  return (
    <section className="chapter-section bg-sand/24 py-[var(--space-section-lg)]">
      <div className="mx-auto grid max-w-standard gap-10 px-6 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <SectionHeading
          eyebrow="Word Of Mouth"
          title="In Their Own Words"
          subtitle="Real experiences shared with The Skin Shop, presented without turning them into manufactured marketing claims."
        />
        <Reveal>
          <div className="border-y border-gold/25 py-8 sm:py-10">
            <span aria-hidden="true" className="font-display text-6xl leading-none text-gold/35">“</span>
            <p className="-mt-3 max-w-3xl text-balance font-display text-[2rem] leading-[1.08] tracking-[-0.025em] text-ink sm:text-[2.45rem] lg:text-[2.8rem]">
              Some customers have reported noticing a difference after as little as three days of consecutive use, and have gone on to recommend products to family and friends.
            </p>
            <p className="mt-7 max-w-2xl text-xs leading-[1.7] text-walnut/52">
              Based on feedback shared with The Skin Shop. Individual experiences may vary; customer-reported experiences are not a guarantee of results.
            </p>
          </div>
        </Reveal>
      </div>
      <div className="mt-14">
        <SectionDivider />
      </div>
    </section>
  );
}
