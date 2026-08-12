"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { products, collections, categories, type Product } from "@/data/products";
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

const filterChips = [...collections, ...categories];

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
    router.replace(`/shop${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }

  const filtered = useMemo(() => {
    let list = products;

    if (activeFilter) {
      list = list.filter(
        (p) =>
          p.collection === activeFilter ||
          p.category === activeFilter ||
          p.ritualTags?.includes(activeFilter as RitualTag),
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
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-16">
      <div className="mb-3">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">Shop All</h1>
        <p className="mt-2 text-sm text-walnut/70">
          {filtered.length} product{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-5 border-b border-gold/20 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyFilter(null)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
              !activeFilter
                ? "border-burgundy bg-burgundy text-ivory"
                : "border-gold/30 text-walnut/70 hover:border-burgundy hover:text-burgundy"
            }`}
          >
            All
          </button>
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => applyFilter(chip)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                activeFilter === chip
                  ? "border-burgundy bg-burgundy text-ivory"
                  : "border-gold/30 text-walnut/70 hover:border-burgundy hover:text-burgundy"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="shop-search" className="sr-only">
            Search products
          </label>
          <input
            id="shop-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full min-w-0 flex-1 rounded-full border border-gold/30 bg-white/60 px-4 py-2 text-sm text-ink placeholder:text-walnut/40 focus:outline-none sm:w-48"
          />
          <label htmlFor="shop-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-full border border-gold/30 bg-white/60 px-4 py-2 text-sm text-ink focus:outline-none"
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
