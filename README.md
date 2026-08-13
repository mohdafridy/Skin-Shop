# The Skin Shop

**Rooted in Kashmir. Made for Your Ritual.**

A premium botanical skincare, body care and hair care storefront, built with
Next.js and Tailwind CSS.

## Stack

- **Next.js 16** (App Router, Server Components, TypeScript)
- **Tailwind CSS v4** for styling
- Product/combo/ingredient display data lives in `src/data/` and is the
  source of truth for everything shown on the site (prices, names, images).
- **Optional commerce backend** (PostgreSQL via Prisma + Stripe Checkout) —
  see [Commerce backend](#commerce-backend) below. The site runs and looks
  complete with none of it configured; checkout, coupons, and newsletter
  signup just show an honest "not connected yet" state instead of erroring.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commerce backend

The cart, combo bundling, and the full checkout form work with no backend at
all. What requires the pieces below is: actually taking a payment, real
coupon codes, the newsletter signup, and admin order/product management.

### 1. Database

Provision a Postgres database (Supabase, Neon, Railway, or your own), then:

```bash
cp .env.example .env.local   # fill in DATABASE_URL at minimum
npm run db:generate
npm run db:migrate           # creates the tables
npm run db:seed              # mirrors src/data/products.ts and src/data/combos.ts into the DB
```

The seed script is the **only** place product/combo data is duplicated, and
only for checkout's own price re-validation — `src/data/*` stays the source
of truth for everything the site displays. Re-run `npm run db:seed` after
editing locked prices there to keep the two in sync.

### 2. Stripe

Add to `.env.local`:

```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Until both are set, `/checkout` shows "Payment isn't connected yet" and
never attempts a charge — this is checked server-side
(`src/lib/stripe.ts#isStripeConfigured`), so there's nothing to toggle in
code once real keys exist; just add them and redeploy.

Checkout uses Stripe's hosted Checkout page for the actual payment step
(our own form still collects shipping/billing first, so Stripe isn't asked
to collect it twice). Configure a webhook pointed at
`https://YOUR-DOMAIN.com/api/webhooks/stripe`, listening for:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### 3. Routes this adds

Public: `GET /api/products`-equivalent data comes from `src/data/products.ts`
directly (no route needed) — the backend only exposes what genuinely needs a
server: `POST /api/checkout`, `POST /api/coupons/validate`,
`POST /api/newsletter`, `POST /api/webhooks/stripe`.

Admin (requires an `x-admin-key` header matching `ADMIN_API_KEY`):
`POST /api/admin/products`, `PATCH`/`DELETE /api/admin/products/[id]`,
`GET /api/admin/orders`, `PATCH /api/admin/orders/[id]`. Replace the simple
API-key guard with real staff authentication before relying on these.

### 4. Order confirmation

`/order-success` only ever renders after verifying payment directly with
Stripe (using the secret key server-side) — never from anything in the URL
alone. It clears the persistent cart only for a cart-mode checkout; a Buy
Now purchase never touches cart items the customer didn't check out.

## Brand assets

Any image slot without a real file renders a deliberate botanical placeholder
(a soft gradient card with a line-art sprig and caption) instead of a broken
image or an invented photo — drop a real file in at the expected path and it
appears with no code changes.

**Still placeholder:**

| What | Path |
| --- | --- |
| Logo (on ivory/light backgrounds) | `public/images/brand/logo.svg` |
| Logo (on dark/transparent header) | `public/images/brand/logo-dark.svg` |
| Additional product angles | `public/images/products/<slug>-2.jpg`, `-3.jpg` |
| Our Story editorial photo | `public/images/kashmir/story-editorial.jpg` |

Product slugs are listed in `src/data/products.ts`; combo slugs in
`src/data/combos.ts`.

## Structure

```
app/            Routes: home, /shop, /products/[slug], /rituals, /our-story,
                /contact, /checkout, /order-success, /shipping, /returns,
                /privacy, /terms, api/*
components/     Reusable UI (Header, ProductCard, CartDrawer, SmartImage, ...)
data/           Product, combo, ingredient, navigation, shipping, tax, coupon data
lib/            Cart context, search, formatting, payment provider abstraction
lib/payment/    PaymentProvider interface + the Stripe Checkout implementation
prisma/         schema.prisma + seed.ts for the optional commerce backend
```

## Notes on scope

- All 12 product prices and all 3 combo prices are locked commercial data —
  see the doc comments in `src/data/products.ts` and `src/data/combos.ts`
  before changing either.
- Shipping rates and tax are architecturally wired up (`src/data/shipping.ts`,
  `src/data/tax.ts`) but intentionally unconfigured — no rate has been
  invented. Checkout shows "Calculated at checkout" until real values are
  supplied.
- No coupon codes are active (`src/data/coupons.ts` is empty by design).
