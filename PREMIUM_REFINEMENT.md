# The Skin Shop — Premium Editorial Refinement Pass

## Scope completed

This pass refines the existing storefront without changing the approved commerce architecture or product catalogue.

### Visual system
- Replaced the display-face usage with Instrument Serif while retaining Manrope for interface/body text.
- Introduced a restrained premium button/link language and reduced excessive pill/card styling.
- Added subtle Kashmir-inspired geometric separators and chapter hairlines.
- Added quiet route-entry, type, image-load, hover and reveal motion with `prefers-reduced-motion` support.
- Retained the existing ivory, burgundy, walnut, antique-gold and supporting brand palette.

### Header and navigation
- Refined the header into a cleaner editorial wordmark treatment while retaining the supplied official logo asset in the footer.
- Refined desktop navigation underline behavior and mobile navigation typography.
- Preserved search, wishlist, account, cart and sticky-header behavior.

### Homepage
- Simplified the trust/pillar strip.
- Refined the hero typography and CTA treatment without replacing the hero photograph.
- Re-art-directed product presentation into quieter, photography-led cards.
- Refined Shop by Need / ritual pathways.
- Added an interactive, non-diagnostic **Build Your Ritual** discovery experience based only on existing products and curated rituals.
- Reworked Curated Rituals into a richer dark editorial composition while preserving combo products and pricing.
- Upgraded ingredient storytelling into a desktop sticky-image explorer and refined mobile ingredient articles.
- Refined the Kashmir/story, customer-experience, craftsmanship, newsletter and footer treatments.

### Shop
- Kept search, filtering and sorting functionality while reducing template-like control chrome.
- Refined the Shop All heading, product count and filter/navigation hierarchy.
- Product cards use approved source images only; the source files are not replaced or modified.

### Product pages
- Refined the gallery, typography, product information hierarchy and purchase controls.
- Added a sticky desktop gallery composition.
- Added a **Ritual Timeline** discovery pathway using existing related products only.
- Preserved add-to-cart, Buy Now, wishlist, reviews, consultation, product data and structured-data behavior.

### Cart and search
- Refined the cart drawer and search overlay into quieter editorial surfaces.
- Preserved cart totals, quantities, coupon logic and checkout routing.

## Explicit exclusions

Per approval, this pass does **not** add:

1. Additional full-bleed editorial image moments (#10 from the concept list).
2. Pointer-following / pseudo-3D product image movement (#13 from the concept list).
3. A custom cursor.
4. Scroll hijacking, floating particles, animated petals, sound, glow effects or other showcase-style gimmicks.

## Commerce / backend freeze

No intentional changes were made to:
- Supabase / database logic
- Prisma schema or migrations
- Razorpay payment logic
- Resend email logic
- API routes
- authentication / admin authorization
- product or combo data files
- product prices
- checkout financial calculations
- order/payment state logic
- approved image files

## Verification performed in this environment

- Compared the working copy against the uploaded source to verify the change surface is frontend/UI-focused.
- Ran a TypeScript/TSX parse check over `src`; no syntax/parse diagnostics were detected.
- A complete framework build/lint could **not** be run because package installation could not complete in this execution environment (`registry.npmjs.org` DNS/network failure). The partially created `node_modules` directory was not copied into this handoff.

## Required verification before deployment

Run in a normal development environment with registry access:

```bash
npm ci
npm run lint
npm run build
```

Then visually QA at minimum:

- 320 px
- 360 px
- 375 px
- 390 px
- 430 px
- tablet portrait
- tablet landscape
- desktop
- large desktop

Functional smoke test:

- navigation + mobile menu
- search
- product filters/sort
- product gallery
- Add to Bag
- Buy Now
- wishlist
- Build Your Ritual
- curated ritual Add to Bag
- cart quantity/remove/coupon
- checkout handoff
- reduced-motion preference

Do not deploy until the normal production build and the existing payment/checkout smoke tests pass.
