import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getStorefrontCatalog } from "@/lib/storefront-catalog";

/**
 * Dynamic sitemap: static marketing/info pages plus every product, generated
 * from src/data/products.ts so a new product is included automatically.
 * Deliberately excludes admin, account, checkout, order-success, track,
 * wishlist and api/* — see robots.ts for the matching disallow rules.
 */
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getStorefrontCatalog();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/rituals`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/our-story`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/shipping`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
