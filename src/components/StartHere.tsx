import { getProductBySlug } from "@/data/products";
import { getComboBySlug } from "@/data/combos";
import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";
import ComboCard from "./ComboCard";
import Reveal from "./Reveal";

/**
 * A gentle, low-commitment entry point for first-time visitors, additive to
 * (never a replacement for) the full 12-product collection shown elsewhere.
 * Uses real, existing bestseller/entry-ritual data — the Moonlight Combo
 * (the smallest, two-step ritual) plus the two products it's built from.
 */
export default function StartHere() {
  const combo = getComboBySlug("moonlight-combo");
  const cleanser = getProductBySlug("husn-e-yusuf-whitening-soap-cleanser");
  const mist = getProductBySlug("ark-e-gulaab");

  if (!combo || !cleanser || !mist) return null;

  return (
    <section className="bg-sand/40 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <SectionHeading
          eyebrow="New To The Skin Shop?"
          title="Start With A Ritual"
          subtitle="No need to learn all twelve products at once. Begin here, and explore the rest of the collection whenever you're ready."
          center
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Reveal>
            <ComboCard combo={combo} />
          </Reveal>
          <Reveal delay={60}>
            <ProductCard product={cleanser} />
          </Reveal>
          <Reveal delay={120}>
            <ProductCard product={mist} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
