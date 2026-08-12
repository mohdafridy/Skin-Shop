# The Skin Shop

**Kashmir, Bottled Beautifully.**

A premium botanical skincare, body care and hair care storefront, built with
Next.js and Tailwind CSS.

## Stack

- **Next.js 16** (App Router, Server Components, TypeScript)
- **Tailwind CSS v4** for styling
- Static product/combo/ingredient data (`src/data/`) — no backend required to
  run the site; the commerce layer (cart) is isolated in `src/lib/cart-context.tsx`
  so a real backend (Shopify, WooCommerce, etc.) can be dropped in later.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Brand assets

Any image slot without a real file renders a deliberate botanical placeholder
(a soft gradient card with a line-art sprig and caption) instead of a broken
image or an invented photo — drop a real file in at the expected path and it
appears with no code changes.

**In place:** all 12 product photos, the hero Kashmir landscape, and two
editorial shots (saffron harvest, textile/craft detail).

**Still placeholder:**

| What | Path |
| --- | --- |
| Logo (on ivory/light backgrounds) | `public/images/brand/logo.svg` |
| Logo (on dark/transparent header) | `public/images/brand/logo-dark.svg` |
| Combo photos (Moon Light / Sun Glow / Radiance Ritual) | `public/images/combos/<combo-slug>.jpg` |
| Additional product angles | `public/images/products/<slug>-2.jpg`, `-3.jpg` |
| Remaining editorial imagery | `public/images/kashmir/rose-garden.jpg`, `brass-textile.jpg` |
| Our Story page image | `public/images/kashmir/our-story.jpg` |

Two supplied Kashmir-themed images were **not** used — an illustrated figure
credited to `@The_Meh...` and a hand-with-basket photo watermarked
`Sheikh...`. Both carry a visible third-party credit mark, so they weren't
published without confirming you hold the rights to use them commercially.
Send over a license/permission (or the unwatermarked originals) and they can
go into the editorial section.

Product slugs are listed in `src/data/products.ts`; combo slugs in
`src/data/combos.ts`.

## Structure

```
app/            Routes: home, /shop, /products/[slug], /rituals, /our-story,
                /contact, /shipping, /returns, /privacy, /terms
components/     Reusable UI (Header, ProductCard, CartDrawer, SmartImage, ...)
data/           Product, combo, ingredient and navigation data
lib/            Cart context, search, formatting
```

## Notes on scope

- Cart is client-side (localStorage) with no checkout/payment integration yet
  — the "Checkout" action tells the shopper checkout is launching soon rather
  than silently failing.
- Product prices, sizes and ingredient lists are omitted wherever they
  weren't supplied, rather than invented.
- Combo (ritual) contents are composed from the mood/positioning copy in the
  brief; confirm the exact bundle contents against the real product line-up
  before launch (see the comment in `src/data/combos.ts`).
