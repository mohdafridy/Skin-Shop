"use client";

import { useMemo, useState } from "react";
import ProductRow from "./ProductRow";

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  image: string;
  price: number;
  currency: string;
  stock: number | null;
  active: boolean;
  newBadge?: { durationDays: number; daysRemaining: number };
};

type View = "all" | "published" | "hidden" | "sold-out" | "new";

const filters: { value: View; label: string }[] = [
  { value: "all", label: "All products" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
  { value: "sold-out", label: "Sold out" },
  { value: "new", label: "NEW badge" },
];

export default function ProductsManager({ products }: { products: AdminProductRow[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("all");

  const counts = useMemo(() => ({
    all: products.length,
    published: products.filter((p) => p.active).length,
    hidden: products.filter((p) => !p.active).length,
    "sold-out": products.filter((p) => p.active && p.stock === 0).length,
    new: products.filter((p) => p.active && p.newBadge && p.newBadge.daysRemaining > 0).length,
  }), [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && ![p.name, p.category, p.collection, p.slug].some((v) => v.toLowerCase().includes(q))) return false;
      if (view === "published") return p.active;
      if (view === "hidden") return !p.active;
      if (view === "sold-out") return p.active && p.stock === 0;
      if (view === "new") return p.active && Boolean(p.newBadge && p.newBadge.daysRemaining > 0);
      return true;
    });
  }, [products, query, view]);

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {([
          ["Products", counts.all],
          ["Live in shop", counts.published],
          ["New arrivals", counts.new],
        ] as const).map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gold/25 bg-white/55 px-5 py-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-walnut/60">{label}</p>
            <p className="mt-1.5 font-display text-4xl leading-none text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-gold/25 bg-white/60 p-4 sm:p-5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-walnut/65">Find a product</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product name, collection or category…"
            className="mt-2 w-full rounded-xl border border-gold/30 bg-ivory px-4 py-3 text-sm text-ink outline-none focus:border-burgundy sm:max-w-xl" />
        </label>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter products">
          {filters.map((item) => (
            <button key={item.value} type="button" onClick={() => setView(item.value)}
              aria-pressed={view === item.value}
              className={"rounded-full px-4 py-2 text-xs font-semibold transition-colors " +
                (view === item.value ? "bg-burgundy text-ivory" : "border border-gold/30 bg-sand/20 text-walnut/80 hover:border-burgundy")}>
              {item.label} <span className="ml-1 opacity-65">{counts[item.value]}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-xs font-medium text-walnut/60">
        Showing {visible.length} of {products.length} products · Most recently added first
      </p>
      {visible.length
        ? <div className="space-y-3">
          {visible.map((p) => <ProductRow key={p.id + "-" + p.stock + "-" + p.active} {...p} />)}
        </div>
        : <div className="rounded-2xl border border-gold/25 bg-white/55 p-10 text-center">
          <p className="font-display text-2xl text-ink">No matching products</p>
          <p className="mt-2 text-sm text-walnut/65">Try clearing your search or choosing a different filter.</p>
          <button type="button" onClick={() => { setView("all"); setQuery(""); }}
            className="mt-4 text-sm font-semibold text-burgundy underline underline-offset-4">Clear filters</button>
        </div>}
    </div>
  );
}
