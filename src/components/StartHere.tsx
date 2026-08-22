import Link from "next/link";
import { getProductBySlug } from "@/data/products";
import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

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
    <section className="chapter-section bg-ivory py-[var(--space-section-lg)]">
      <div className="mx-auto max-w-standard px-6 sm:px-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeading
            eyebrow="New To The Skin Shop?"
            title="A Beautiful Place to Begin"
            subtitle="Loved, reordered and recommended — the formulas customers come back to, and an easy place to start."
            size="large"
          />
          <Link href="/shop" className="editorial-link mb-1 w-fit text-burgundy">
            Explore the collection <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-7 lg:grid-cols-5 lg:gap-x-7">
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
