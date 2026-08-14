import SectionHeading from "./SectionHeading";
import SectionDivider from "./SectionDivider";

export default function CustomerExperience() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
        <SectionHeading eyebrow="Word Of Mouth" title="The Difference People Talk About" center />
        <p className="mt-6 text-balance text-lg leading-relaxed text-walnut/85">
          According to feedback shared with The Skin Shop, some customers have reported
          noticing a difference after as little as three days of consecutive use.
          Customers have also recommended products to family and friends after
          incorporating them into their routines.
        </p>
        <p className="mt-6 text-sm text-walnut/70">
          Individual experiences may vary. Customer-reported experiences are not a
          guarantee of results.
        </p>
      </div>
      <div className="mt-16">
        <SectionDivider />
      </div>
    </section>
  );
}
