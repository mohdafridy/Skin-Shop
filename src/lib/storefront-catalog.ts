import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { products as originalProducts, type Product, type ProductCollection, type RitualTag } from "@/data/products";
import type { Prisma } from "@prisma/client";

export type ProductDetails = {
  tagline?: string;
  shortDescription?: string;
  description?: string;
  size?: string;
  suitableFor?: string;
  ingredients?: string[];
  benefits?: string[];
  ritual?: string[];
  gallery?: string[];
  related?: string[];
  ritualTags?: RitualTag[];
  featured?: boolean;
  bestseller?: boolean;
};
type StoredProduct = {
  id: string; slug: string; name: string; shortName: string | null;
  category: string; collection: string; price: number; currency: string;
  image: string; active: boolean; stock: number | null;
  details?: Prisma.JsonValue | null;
};
function parseDetails(value: Prisma.JsonValue | null | undefined): ProductDetails {
  if (!value || Array.isArray(value) || typeof value !== "object") return {};
  const data = value as Record<string, unknown>;
  const str = (k: string): string | undefined => typeof data[k] === "string" ? data[k] as string : undefined;
  const list = (k: string): string[] | undefined => Array.isArray(data[k])
    ? (data[k] as unknown[]).filter((v): v is string => typeof v === "string") : undefined;
  return {
    tagline: str("tagline"), shortDescription: str("shortDescription"), description: str("description"),
    size: str("size"), suitableFor: str("suitableFor"), ingredients: list("ingredients"),
    benefits: list("benefits"), ritual: list("ritual"), gallery: list("gallery"),
    related: list("related"), ritualTags: list("ritualTags") as RitualTag[] | undefined,
    featured: typeof data.featured === "boolean" ? data.featured : undefined,
    bestseller: typeof data.bestseller === "boolean" ? data.bestseller : undefined,
  };
}
export function asStorefrontProduct(row: StoredProduct): Product {
  const legacy = originalProducts.find((p) => p.slug === row.slug);
  const details = parseDetails(row.details);
  const image = row.image || legacy?.image || "";
  return {
    ...legacy, id: row.id, slug: row.slug, name: row.name, shortName: row.shortName ?? undefined,
    category: row.category, collection: row.collection as ProductCollection, price: row.price,
    currency: row.currency, image, stock: row.stock, active: row.active,
    tagline: details.tagline ?? legacy?.tagline ?? row.name,
    shortDescription: details.shortDescription ?? legacy?.shortDescription ?? row.name,
    description: details.description ?? legacy?.description ?? row.name,
    size: details.size ?? legacy?.size,
    suitableFor: details.suitableFor ?? legacy?.suitableFor,
    ingredients: details.ingredients ?? legacy?.ingredients,
    benefits: details.benefits ?? legacy?.benefits,
    ritual: details.ritual ?? legacy?.ritual,
    gallery: details.gallery?.length ? details.gallery : [image],
    related: details.related ?? legacy?.related,
    ritualTags: details.ritualTags ?? legacy?.ritualTags,
    featured: details.featured ?? legacy?.featured,
    bestseller: details.bestseller ?? legacy?.bestseller,
  };
}

/** Names, prices, images and availability must come from the same database as checkout. */
export const getStorefrontCatalog = cache(async (): Promise<Product[]> => {
  if (!process.env.DATABASE_URL) return originalProducts;
  try {
    const rows = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
    return rows.map(asStorefrontProduct);
  } catch (error) {
    if ((error as {code?:string}).code !== "P2022") throw error;
    // Handles a preview DB that has not yet received the additive details migration.
    const rows = await prisma.product.findMany({
      where: {active:true}, orderBy: {createdAt:"asc"},
      select: { id:true,slug:true,name:true,shortName:true,category:true,collection:true,
        price:true,currency:true,image:true,stock:true,active:true },
    });
    return rows.map(asStorefrontProduct);
  }
});
export async function getStorefrontProduct(slug: string) {
  return (await getStorefrontCatalog()).find((p) => p.slug === slug);
}
