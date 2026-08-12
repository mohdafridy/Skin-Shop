"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { searchProducts } from "@/lib/search";
import SmartImage from "./SmartImage";

export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchProducts(query);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setQuery("");
  }

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative mx-auto mt-24 w-[92%] max-w-2xl rounded-2xl bg-ivory p-6 shadow-2xl sm:p-8">
        <div className="flex items-center gap-3 border-b border-gold/25 pb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-5 w-5 flex-shrink-0 text-walnut/60"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <label htmlFor="search-input" className="sr-only">
            Search products
          </label>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, ingredients, rituals…"
            className="w-full bg-transparent font-display text-xl text-ink placeholder:text-walnut/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-sand"
          >
            <span aria-hidden>&times;</span>
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {query.trim() === "" ? (
            <p className="py-8 text-center text-sm text-walnut/70">
              Try &ldquo;rose&rdquo;, &ldquo;serum&rdquo; or &ldquo;saffron&rdquo;.
            </p>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-display text-lg text-ink">No products found</p>
              <p className="mt-1 text-sm text-walnut/70">
                Try a different search, or browse the full collection.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="mt-4 inline-block text-sm font-medium text-burgundy hover:underline"
              >
                Shop All →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gold/15">
              {results.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3"
                  >
                    <SmartImage
                      src={product.image}
                      alt={product.name}
                      label={product.shortName ?? product.name}
                      className="h-14 w-14 flex-shrink-0 rounded-lg"
                      sizes="56px"
                    />
                    <div>
                      <p className="font-medium text-ink">{product.name}</p>
                      <p className="text-xs uppercase tracking-wide text-walnut/70">
                        {product.category}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
