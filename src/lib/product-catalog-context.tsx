"use client";

import { createContext, useContext, useMemo } from "react";
import type { Product } from "@/data/products";

type CatalogContextValue = {
  products: Product[];
  getProduct: (slug: string) => Product | undefined;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const value = useMemo(() => {
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    return { products, getProduct: (slug: string) => bySlug.get(slug) };
  }, [products]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used within CatalogProvider");
  return context;
}
