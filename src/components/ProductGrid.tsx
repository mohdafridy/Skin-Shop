import type { Product } from "@/data/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

export default function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyMessage = "Try a different filter or search term.",
}: {
  products: Product[];
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-2xl text-ink">{emptyTitle}</p>
        <p className="mt-2 text-sm text-walnut/70">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
      {products.map((product, i) => (
        <Reveal key={product.slug} delay={(i % 4) * 60}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}
