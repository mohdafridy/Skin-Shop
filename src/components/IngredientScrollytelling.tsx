"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ingredientStories } from "@/data/ingredients";
import { getProductBySlug } from "@/data/products";
import { track } from "@/lib/analytics";
import SmartImage from "./SmartImage";
import BotanicalMark from "./BotanicalMark";

/**
 * Desktop-only (lg+) editorial pairing: a sticky image on the left
 * crossfades to match whichever ingredient is nearest the vertical center
 * of the viewport as the right-hand story list scrolls past. All story
 * copy stays visible at all times — this is a sync effect, not an
 * accordion. Mobile gets a separate stacked-card layout (see
 * IngredientStorytelling.tsx); this component is hidden there.
 */
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
      // A thin band through the vertical center of the viewport — whichever
      // row crosses it becomes active, the classic scrollytelling technique.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const node of rowRefs.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hidden gap-20 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <div className="sticky top-28 self-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-sand">
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
                className={`absolute inset-0 transition-opacity duration-500 ease-premium ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                {imageSrc ? (
                  <SmartImage
                    src={imageSrc}
                    alt={ingredient.name}
                    label={ingredient.name}
                    className="h-full w-full"
                    sizes="45vw"
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
      </div>

      <div className="flex flex-col gap-20 py-8">
        {ingredientStories.map((ingredient) => {
          const product = ingredient.relatedProductSlugs[0]
            ? getProductBySlug(ingredient.relatedProductSlugs[0])
            : undefined;
          const isActive = activeId === ingredient.id;

          return (
            <div
              key={ingredient.id}
              data-ingredient-id={ingredient.id}
              ref={(node) => {
                if (node) rowRefs.current.set(ingredient.id, node);
                else rowRefs.current.delete(ingredient.id);
              }}
              className="max-w-md"
            >
              <h3
                className={`font-display text-2xl transition-colors duration-300 ease-premium ${
                  isActive ? "text-burgundy" : "text-ink"
                }`}
              >
                {ingredient.name}
              </h3>
              <span
                aria-hidden="true"
                className={`mt-3 block h-px bg-gold transition-all duration-300 ease-premium ${
                  isActive ? "w-12 opacity-100" : "w-6 opacity-40"
                }`}
              />
              <p className="mt-4 text-balance leading-relaxed text-walnut/75">{ingredient.story}</p>
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
                  className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-burgundy underline-offset-2 hover:underline"
                >
                  Discover {product.shortName ?? product.name}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-[180ms] ease-premium group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
