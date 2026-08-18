import SectionHeading from "./SectionHeading";
import SectionDivider from "./SectionDivider";

export default function CustomerExperience() {
  return (
    <section className="py-[var(--space-section-md)]">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
        <SectionHeading
          eyebrow="Word Of Mouth"
          title="In Their Own Words"
          subtitle="Real experiences from people who have made The Skin Shop part of their everyday care."
          center
        />
        <p className="mt-6 text-balance text-lg leading-relaxed text-walnut/85">
          According to feedback shared with The Skin Shop, some customers have reported
          noticing a difference after as little as three days of consecutive use.
          Customers have also recommended products to family and friends after
          using them regularly.
        </p>
        <p className="mt-6 text-sm text-walnut/70">
          Individual experiences may vary. Customer-reported experiences are not a
          guarantee of results.
        </p>
      </div>
      <div className="mt-12">
        <SectionDivider />
      </div>
    </section>
  );
}
