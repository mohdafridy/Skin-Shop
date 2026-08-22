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
  const imageSrc = ingredient.image ?? primaryProduct?.image;

  return (
    <article className="flex h-full flex-col border-b border-gold/20 pb-7">
      {imageSrc ? (
        <SmartImage
          src={imageSrc}
          alt={ingredient.name}
          label={ingredient.name}
          className="aspect-[4/3]"
          sizes="(min-width: 640px) 45vw, 92vw"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-sand/40">
          <BotanicalMark className="h-8 w-8 text-gold" />
        </div>
      )}
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="font-display text-[2rem] leading-none tracking-[-0.03em] text-ink">{ingredient.name}</h3>
        <p className="mt-3 flex-1 text-balance text-sm leading-[1.75] text-walnut/68">{ingredient.story}</p>
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
            className="editorial-link mt-5 w-fit text-burgundy"
          >
            Discover {primaryProduct.shortName ?? primaryProduct.name}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </article>
  );
}
