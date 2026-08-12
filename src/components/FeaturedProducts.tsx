import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function FeaturedProducts() {
  const featured = products.filter((p) => p.featured);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-24">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading eyebrow="Begin Here" title="The Ritual Begins Here" />
        <Link
          href="/shop"
          className="flex-shrink-0 text-sm font-medium text-burgundy hover:underline"
        >
          Shop The Collection →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
        {featured.map((product, i) => (
          <Reveal key={product.slug} delay={i * 60}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
