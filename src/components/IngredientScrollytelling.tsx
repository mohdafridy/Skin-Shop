"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ingredientStories } from "@/data/ingredients";
import { getProductBySlug } from "@/data/products";
import { track } from "@/lib/analytics";
import SmartImage from "./SmartImage";
import BotanicalMark from "./BotanicalMark";

export default function IngredientScrollytelling() {
  const [activeId, setActiveId] = useState(ingredientStories[0].id);
  const rowRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-ingredient-id");
            if (id) setActiveId(id);
          }
        }
      },
      { rootMargin: "-44% 0px -44% 0px", threshold: 0 },
    );

    for (const node of rowRefs.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const activeIndex = Math.max(0, ingredientStories.findIndex((ingredient) => ingredient.id === activeId));

  return (
    <div className="hidden gap-20 lg:grid lg:grid-cols-[1.02fr_0.98fr] xl:gap-28">
      <div className="sticky top-28 self-start">
        <div className="mb-4 flex items-center justify-between border-b border-gold/20 pb-3">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-walnut/48">Ingredient study</p>
          <p className="font-display text-lg tracking-[-0.02em] text-burgundy">
            {String(activeIndex + 1).padStart(2, "0")} <span className="text-walnut/35">/ {String(ingredientStories.length).padStart(2, "0")}</span>
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          {ingredientStories.map((ingredient) => {
            const product = ingredient.relatedProductSlugs[0]
              ? getProductBySlug(ingredient.relatedProductSlugs[0])
              : undefined;
            const imageSrc = ingredient.image ?? product?.image;
            const isActive = activeId === ingredient.id;

            return (
              <div
                key={ingredient.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-[opacity,transform] duration-[750ms] ease-premium ${
                  isActive ? "scale-100 opacity-100" : "scale-[1.01] opacity-0"
                }`}
              >
                {imageSrc ? (
                  <SmartImage
                    src={imageSrc}
                    alt={ingredient.name}
                    label={ingredient.name}
                    className="h-full w-full"
                    sizes="48vw"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-sand via-ivory to-sand px-6 text-center">
                    <BotanicalMark className="h-10 w-10 text-gold" />
                    <span className="font-display text-lg text-walnut/70">{ingredient.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-gold/60" aria-hidden="true">
          <span className="h-px flex-1 bg-gold/25" />
          <span className="kashmir-motif"><span /><span /><span /></span>
        </div>
      </div>

      <div className="flex flex-col py-4">
        {ingredientStories.map((ingredient, index) => {
          const product = ingredient.relatedProductSlugs[0]
            ? getProductBySlug(ingredient.relatedProductSlugs[0])
            : undefined;
          const isActive = activeId === ingredient.id;

          return (
            <article
              key={ingredient.id}
              data-ingredient-id={ingredient.id}
              ref={(node) => {
                if (node) rowRefs.current.set(ingredient.id, node);
                else rowRefs.current.delete(ingredient.id);
              }}
              className={`max-w-xl border-b border-gold/18 py-16 transition-opacity duration-300 first:pt-6 last:border-b-0 ${
                isActive ? "opacity-100" : "opacity-58"
              }`}
            >
              <div className="flex items-baseline gap-4">
                <span className="text-[0.65rem] font-semibold tracking-[0.14em] text-gold/75">{String(index + 1).padStart(2, "0")}</span>
                <h3
                  className={`font-display text-[3rem] leading-[0.92] tracking-[-0.04em] transition-colors duration-300 ease-premium xl:text-[3.55rem] ${
                    isActive ? "text-burgundy" : "text-ink"
                  }`}
                >
                  {ingredient.name}
                </h3>
              </div>
              <p className="mt-6 max-w-lg text-balance text-[0.95rem] leading-[1.85] text-walnut/68">{ingredient.story}</p>
              {product && (
                <Link
                  href={`/products/${product.slug}`}
                  onClick={() =>
                    track({
                      name: "ingredient_product_click",
                      ingredient: ingredient.name,
                      productSlug: product.slug,
                    })
                  }
                  className="editorial-link mt-6 text-burgundy"
                >
                  Discover {product.shortName ?? product.name}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
