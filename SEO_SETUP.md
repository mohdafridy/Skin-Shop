# SEO Setup

Technical SEO for The Skin Shop — metadata, structured data, sitemap and
indexing rules. No visual/UX changes were made; this is all `<head>`
metadata, JSON-LD, `sitemap.xml` and `robots.txt`.

## 1. What was implemented

- Global metadata (title template, description, Open Graph, Twitter card,
  robots defaults) in `src/app/layout.tsx`.
- Per-page metadata (title, description, canonical URL) on every public
  route, generated dynamically for products.
- `noindex` on private/transactional pages: `/checkout`, `/account`,
  `/order-success`, `/wishlist`, `/track/[token]`, `/admin/*` (the last two
  already had it).
- JSON-LD structured data: sitewide `Organization` + `WebSite`, `Product` +
  `BreadcrumbList` on every product page.
- `sitemap.xml` and `robots.txt`, generated dynamically.
- Canonical URLs, including collapsing `/shop`'s filter query params
  (`?collection=`, `?category=`, `?ritual=`, `?q=`) to the plain `/shop`
  URL so filtered views aren't indexed as near-duplicates.

## 2. Where global SEO settings live

`src/lib/seo.ts` — `SITE_NAME`, `SITE_URL`, `DEFAULT_TITLE`,
`DEFAULT_DESCRIPTION`, `DEFAULT_OG_IMAGE`, plus the `canonical()`,
`noIndex`, `absoluteUrl()` and JSON-LD builder helpers used across the app.

`SITE_URL`/`SITE_NAME` reuse the site's existing `siteUrl()`/`storeName`
helpers from `src/lib/notifications/templates.ts` (already the canonical
source for the site's public URL used in order notifications) rather than
duplicating them. `SITE_URL` ultimately comes from `NEXT_PUBLIC_SITE_URL`.

## 3. How product SEO is generated

`src/app/products/[slug]/page.tsx`'s `generateMetadata` builds title,
description, canonical URL, Open Graph and Twitter metadata directly from
`src/data/products.ts` (the site's single source of truth for product data)
— nothing is hardcoded per product. `productJsonLd()` in `src/lib/seo.ts`
builds the `Product` JSON-LD (name, description, image, sku, brand, url,
offer price/currency/availability) the same way. Adding a product to
`src/data/products.ts` is the only step needed; its page, sitemap entry and
structured data follow automatically.

## 4. How category SEO is generated

The site's collections/categories ("Skin", "Hair", "Body", per-product
`category`) are implemented as query-param filters on the single
client-rendered `/shop` page, not as separate routes. Rather than invent
category URLs that don't exist in the app's routing, `/shop` canonicalizes
every filtered/sorted/searched variant to plain `/shop`, so search engines
index one clean page instead of many near-duplicate parameter URLs.

**If you want indexable category pages later** (e.g. `/shop/skin`), that's
a routing change — a new dynamic route reusing `ShopClient`'s filtering
logic with a real path segment instead of a query param — intentionally
left out of this PR since it changes URL structure and is outside
"metadata-only" scope. Happy to build it as a follow-up if wanted.

## 5. Sitemap

`src/app/sitemap.ts` — served at `/sitemap.xml`. Includes the homepage,
static marketing/info pages, and every product from `src/data/products.ts`.
Excludes admin, account, checkout, order-success, track, wishlist and all
`/api/*` routes. No `lastModified` values are set — the static data files
don't track real modification timestamps, and the instructions were not to
invent them.

## 6. Robots.txt

`src/app/robots.ts` — served at `/robots.txt`. Allows crawling of the
public storefront; disallows `/admin`, `/account`, `/checkout`,
`/order-success` (carries a per-order access token in its URL), `/track/`
(same — per-order token) and `/api/`. References the sitemap.

## 7. Structured data implementation

- `Organization` + `WebSite` — sitewide, in `src/app/layout.tsx`. Uses the
  real business email/phone from `src/data/contact.ts`, founding year, and
  `sameAs: [instagramUrl]` (real Instagram profile). **No `logo` field** —
  the brand logo is still a placeholder (see README's "Still placeholder"
  table), so nothing exists to reference honestly yet. Add it to
  `organizationJsonLd()` in `src/lib/seo.ts` once it's real.
- `Product` + `BreadcrumbList` — every `/products/[slug]` page.
- No `aggregateRating`/`review` anywhere — there's no real review data in
  the app, and the instructions were explicit not to fabricate any.

## 8. Adding Google Search Console verification

1. In Search Console, choose the "HTML tag" verification method for the
   domain property — it gives you a `content="..."` value.
2. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in `.env.local` (and your
   production environment) to that value.
3. Redeploy. `src/app/layout.tsx` picks it up automatically via
   `GOOGLE_SITE_VERIFICATION` in `src/lib/seo.ts` — nothing else to change.

No value is set by default; nothing was invented.

## 9. What needs to be configured before production

- `NEXT_PUBLIC_SITE_URL` — set to the real production domain. Every
  canonical URL, OG/Twitter URL, sitemap entry and JSON-LD `url` is derived
  from this.
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — see above, optional.
- A real logo file at `public/images/brand/logo.svg` (see README) — once it
  exists, add it to `organizationJsonLd()`.

## 10. Verifying after deployment

- `https://YOUR-DOMAIN/sitemap.xml` and `https://YOUR-DOMAIN/robots.txt`
  should load and list the expected URLs.
- Google's [Rich Results Test](https://search.google.com/test/rich-results)
  against a product URL should show valid `Product` and `BreadcrumbList`
  markup with no errors.
- View source (not just DevTools, since some of this is server-rendered
  metadata) on a product page and confirm `<link rel="canonical">`, the
  `<title>`, and the two `<script type="application/ld+json">` blocks are
  present.
- Submit the sitemap URL in Google Search Console once the site verifies.
