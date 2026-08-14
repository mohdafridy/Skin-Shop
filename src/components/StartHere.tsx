import { getProductBySlug } from "@/data/products";
import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

/**
 * A gentle, low-commitment entry point for first-time visitors, additive to
 * (never a replacement for) the full 12-product collection shown elsewhere.
 * Highlights five real hot-sellers.
 */
export default function StartHere() {
  const slugs = [
    "husn-e-yusuf-whitening-soap-cleanser",
    "dahab-whitening-night-cream",
    "vitamin-c-serum",
    "coffee-detox-facemask",
    "ark-e-gulaab",
  ];
  const products = slugs.map(getProductBySlug).filter((p) => p != null);

  if (products.length === 0) return null;

  return (
    <section className="bg-sand/40 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <SectionHeading
          eyebrow="New To The Skin Shop?"
          title="Begin Your Routine"
          subtitle="No need to learn all twelve products at once. Begin here, and explore the rest of the collection whenever you're ready."
          center
        />

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product, i) => (
            <Reveal key={product.slug} delay={i * 60}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
