import { products, type Product } from "@/data/products";

function normalize(value: string): string {
  // Product names may use non-breaking spaces to keep a proper noun from
  // wrapping mid-phrase; treat them the same as a regular space when matching.
  return value.replace(/ /g, " ").toLowerCase().trim();
}

export function searchProducts(query: string, limit = 8): Product[] {
  const q = normalize(query);
  if (!q) return [];

  return products
    .map((product) => {
      const haystack = normalize(
        [
          product.name,
          product.shortName ?? "",
          product.category,
          product.collection,
          product.tagline,
          product.shortDescription,
        ].join(" "),
      );

      let score = 0;
      if (normalize(product.name).startsWith(q)) score += 4;
      if (haystack.includes(q)) score += 2;
      for (const word of q.split(/\s+/)) {
        if (word.length > 1 && haystack.includes(word)) score += 1;
      }
      return { product, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((result) => result.product);
}
