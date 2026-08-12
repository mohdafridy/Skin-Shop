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

**No product photography, logo, or Kashmir imagery has been supplied yet.**
Rather than generate placeholder photos and risk them being mistaken for
approved brand assets, every image slot renders a deliberate botanical
placeholder (a soft gradient card with a line-art sprig and caption) until a
real file is dropped in at its expected path — no code changes needed:

| What | Path |
| --- | --- |
| Logo (on ivory/light backgrounds) | `public/images/brand/logo.svg` |
| Logo (on dark/transparent header) | `public/images/brand/logo-dark.svg` |
| Hero landscape | `public/images/kashmir/hero-landscape.jpg` |
| Product photos | `public/images/products/<slug>.jpg` (+ `-2.jpg`, `-3.jpg` for gallery) |
| Combo photos | `public/images/combos/<combo-slug>.jpg` |
| Editorial / Our Story imagery | `public/images/kashmir/*.jpg` |

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
