"use client";

import Link from "next/link";
import type { IngredientStory } from "@/data/ingredients";
import { getProductBySlug } from "@/data/products";
import { track } from "@/lib/analytics";
import SmartImage from "./SmartImage";
import BotanicalMark from "./BotanicalMark";

export default function IngredientCard({ ingredient }: { ingredient: IngredientStory }) {
  const primaryProduct = ingredient.relatedProductSlugs[0]
    ? getProductBySlug(ingredient.relatedProductSlugs[0])
    : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gold/20 bg-white/40">
      {primaryProduct ? (
        <SmartImage
          src={primaryProduct.image}
          alt={ingredient.name}
          label={ingredient.name}
          className="aspect-[4/3]"
          sizes="(min-width: 1024px) 22vw, 45vw"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-sand/40">
          <BotanicalMark className="h-8 w-8 text-gold" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl text-ink">{ingredient.name}</h3>
        <p className="mt-2 flex-1 text-balance text-sm leading-relaxed text-walnut/75">
          {ingredient.story}
        </p>
        {primaryProduct && (
          <Link
            href={`/products/${primaryProduct.slug}`}
            onClick={() =>
              track({
                name: "ingredient_product_click",
                ingredient: ingredient.name,
                productSlug: primaryProduct.slug,
              })
            }
            className="group mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-burgundy underline-offset-2 hover:underline"
          >
            Discover {primaryProduct.shortName ?? primaryProduct.name}
            <span
              aria-hidden="true"
              className="transition-transform duration-[180ms] ease-premium group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
