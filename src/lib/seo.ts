import type { Metadata } from "next";
import { siteUrl, storeName } from "@/lib/notifications/templates";
import { brandLine, foundedYear } from "@/data/navigation";
import { contactEmail, contactPhoneDisplay, instagramUrl } from "@/data/contact";

/**
 * Central, non-visual SEO configuration. Reuses siteUrl()/storeName from
 * lib/notifications/templates.ts — the site's existing canonical-URL and
 * brand-name source — instead of a second copy.
 */
export const SITE_NAME = storeName;
export const SITE_URL = siteUrl();
export const DEFAULT_TITLE = `${SITE_NAME} — ${brandLine}`;
export const DEFAULT_DESCRIPTION =
  "Organic, botanical skincare handcrafted in Kashmir. Discover The Skin Shop's collection of cleansers, serums, creams and rituals rooted in traditional craftsmanship and result-oriented, cruelty-free formulations. Ships across India.";
// Real, already-published asset (the homepage hero) — not a fabricated image.
export const DEFAULT_OG_IMAGE = "/images/kashmir/hero-landscape.jpg";

/** Google Search Console HTML-tag verification value. Unset until the
 * owner adds it in Search Console — see SEO_SETUP.md. Never invented here. */
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** `alternates.canonical` for a page's metadata export. */
export function canonical(path: string): Metadata["alternates"] {
  return { canonical: path };
}

/** For private/transactional pages that should never appear in search
 * results (checkout, account, order confirmation, wishlist, etc). */
export const noIndex: Metadata["robots"] = { index: false, follow: false };

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/images/brand/logo.png"),
    email: contactEmail,
    telephone: contactPhoneDisplay,
    foundingDate: String(foundedYear),
    sameAs: [instagramUrl],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  image: string;
  category: string;
  price: number;
  currency: string;
}) {
  const url = absoluteUrl(`/products/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: absoluteUrl(product.image),
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    url,
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: product.currency,
      // No stock-tracking field exists in the static product data (source
      // of truth per README); matches the availability already asserted
      // here before this change.
      availability: "https://schema.org/InStock",
    },
  };
}
