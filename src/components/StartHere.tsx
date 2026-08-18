import { getProductBySlug } from "@/data/products";
import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

/**
 * The homepage's single product-discovery section: the five best-sellers,
 * doubling as an easy entry point for first-time visitors (this merges what
 * used to be a separate "Bestsellers" row, so the same products never appear
 * twice within one short scroll). Order and selection supplied by the business.
 */
export default function StartHere() {
  const slugs = [
    "dahab-whitening-night-cream",
    "vitamin-c-serum",
    "husn-e-yusuf-whitening-soap-cleanser",
    "coffee-detox-facemask",
    "argan-body-whitening-cream",
  ];
  const products = slugs.map(getProductBySlug).filter((p) => p != null);

  if (products.length === 0) return null;

  return (
    <section className="bg-sand/40 py-[var(--space-section-md)]">
      <div className="mx-auto max-w-standard px-6 sm:px-8">
        <SectionHeading
          eyebrow="New To The Skin Shop?"
          title="A Beautiful Place to Begin"
          subtitle="Loved, reordered and recommended — the formulas customers come back to, and an easy place to start."
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
