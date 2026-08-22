"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { products, collections, type Product } from "@/data/products";
import type { RitualTag } from "@/data/products";
import ProductGrid from "@/components/ProductGrid";

type SortOption = "featured" | "name-asc" | "name-desc" | "price-asc" | "price-desc";

const sortLabels: Record<SortOption, string> = {
  featured: "Featured",
  "name-asc": "Name: A to Z",
  "name-desc": "Name: Z to A",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

const filterChips = [...collections];

function sortProducts(list: Product[], sort: SortOption): Product[] {
  const copy = [...list];
  if (sort === "name-asc") return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc") return copy.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return copy.sort((a, b) => b.price - a.price);
  return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
}

export default function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFilter =
    searchParams.get("filter") ??
    searchParams.get("collection") ??
    searchParams.get("category") ??
    searchParams.get("ritual") ??
    null;

  const [activeFilter, setActiveFilter] = useState<string | null>(initialFilter);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState<SortOption>("featured");

  function applyFilter(value: string | null) {
    setActiveFilter(value);
    const params = new URLSearchParams();
    if (value) params.set("filter", value);
    if (query) params.set("q", query);
    router.replace(`/shop${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    let list = products;

    if (activeFilter) {
      const values = activeFilter.split(",");
      list = list.filter((p) =>
        values.some(
          (v) => p.collection === v || p.category === v || p.ritualTags?.includes(v as RitualTag),
        ),
      );
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) =>
        [p.name, p.category, p.collection, p.tagline].join(" ").toLowerCase().includes(q),
      );
    }

    return sortProducts(list, sort);
  }, [activeFilter, query, sort]);

  return (
    <div className="mx-auto max-w-standard px-6 pb-[var(--space-section-lg)] pt-14 sm:px-8 lg:pt-20">
      <header className="border-b border-gold/20 pb-8 lg:pb-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold/80" aria-hidden="true" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-burgundy">The Collection</p>
            </div>
            <h1 className="mt-4 font-display text-[clamp(3.2rem,7vw,6.3rem)] leading-[0.88] tracking-[-0.055em] text-ink">Shop All</h1>
          </div>
          <p className="pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-walnut/48">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <div className="mb-12 grid gap-6 border-b border-gold/20 py-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex min-w-0 flex-wrap gap-x-6 gap-y-1">
          <button
            type="button"
            onClick={() => applyFilter(null)}
            className={`editorial-tab ${!activeFilter ? "is-active" : ""}`}
          >
            All
          </button>
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => applyFilter(chip)}
              className={`editorial-tab ${activeFilter === chip ? "is-active" : ""}`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(180px,240px)_auto] sm:items-end">
          <div>
            <label htmlFor="shop-search" className="block text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-walnut/45">Search</label>
            <input
              id="shop-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Product or ingredient…"
              className="mt-1 w-full border-0 border-b border-gold/30 bg-transparent px-0 py-2 text-sm text-ink outline-none transition-colors placeholder:text-walnut/35 focus:border-burgundy focus:ring-0"
            />
          </div>
          <div>
            <label htmlFor="shop-sort" className="block text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-walnut/45">Sort</label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="mt-1 min-w-44 border-0 border-b border-gold/30 bg-transparent px-0 py-2 pr-7 text-sm text-ink outline-none transition-colors focus:border-burgundy focus:ring-0"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ProductGrid
        products={filtered}
        emptyTitle="No products found"
        emptyMessage="Try clearing filters or searching for something else."
      />
    </div>
  );
}
