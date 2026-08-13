"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-context";
import { getProductBySlug } from "@/data/products";
import ProductGrid from "@/components/ProductGrid";

export default function WishlistClient() {
  const { slugs } = useWishlist();
  const products = slugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <>
      <ProductGrid
        products={products}
        emptyTitle="Nothing saved yet"
        emptyMessage="Tap the heart on any product to keep it here for later."
      />
      {products.length === 0 && (
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-block rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
          >
            Explore The Collection
          </Link>
        </div>
      )}
    </>
  );
}
