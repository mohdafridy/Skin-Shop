# The Skin Shop

**Rooted in Kashmir. Made for Your Ritual.**

A premium botanical skincare, body care and hair care storefront, built with
Next.js and Tailwind CSS.

## Stack

- **Next.js 16** (App Router, Server Components, TypeScript)
- **Tailwind CSS v4** for styling
- Product/combo/ingredient display data lives in `src/data/` and is the
  source of truth for everything shown on the site (prices, names, images).
- **Optional commerce backend** (PostgreSQL via Prisma + Razorpay Checkout) —
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

### 2. Razorpay

Add to `.env.local`:

```
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."   # same value as RAZORPAY_KEY_ID
```

Until `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are both set, `/checkout`
shows "Payment isn't connected yet" and never attempts a charge — this is
checked server-side (`src/lib/razorpay.ts#isRazorpayConfigured`), so
there's nothing to toggle in code once real keys exist; just add them and
redeploy.

Checkout opens Razorpay's Checkout modal in the browser (our own form still
collects shipping/billing first). The browser's success callback is never
trusted on its own: `/api/payments/razorpay/verify` checks the HMAC
signature and confirms the payment with Razorpay's API before the order is
marked paid, and the redirect to `/order-success` reads that persisted
status — never anything from the URL. Configure a webhook pointed at
`https://YOUR-DOMAIN.com/api/webhooks/razorpay`, listening for:

- `order.paid`
- `payment.captured`
- `payment.failed`
- `refund.created`
- `refund.processed`

`refund.created`/`refund.processed` are **required** if you ever issue
refunds — they're what moves the order to `REFUND_PENDING`/`REFUNDED`.

Webhook handling is idempotent: the `ProcessedWebhookEvent` marker is
written inside the same transaction as the status update, so a redelivered
event is rejected on the marker's primary key. Stock, coupon usage and
customer notifications are never applied twice for one event.

**Known gap:** a limited-use coupon reserves one use when checkout starts.
If the shopper closes the Razorpay modal instead of paying, no webhook
fires (Razorpay has no equivalent of Stripe's `checkout.session.expired`),
so that reservation is never released. Low-impact for typical usage limits,
but worth knowing if you rely on tightly-capped codes.

### 3. Routes this adds

Public: `GET /api/products`-equivalent data comes from `src/data/products.ts`
directly (no route needed) — the backend only exposes what genuinely needs a
server: `POST /api/checkout`, `POST /api/payments/razorpay/verify`,
`POST /api/coupons/validate`, `POST /api/newsletter`,
`POST /api/webhooks/razorpay`, and `/track/[token]` (guest order tracking,
gated on the order's `accessToken` — never on the order number alone).

Admin (requires an `x-admin-key` header matching `ADMIN_API_KEY`):
`POST /api/admin/products`, `PATCH`/`DELETE /api/admin/products/[id]`,
`GET /api/admin/orders`, `PATCH /api/admin/orders/[id]` (also where manual
fulfilment updates — status, courier, tracking number/URL — are recorded;
see "Admin dashboard" below). Replace the simple API-key guard with real
staff authentication before relying on these.

### 4. Customer accounts (optional)

Guest checkout is the default and always works. Accounts add order history
only, and need nothing beyond `DATABASE_URL`:

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `/account` — sign-in/register when signed out, profile + order history when
  signed in.

Passwords are hashed with `scrypt` from `node:crypto` (no third-party
hashing dependency); sessions are opaque random tokens stored in the
`Session` table and sent as an httpOnly, SameSite=Lax cookie that is
`secure` in production. Without `DATABASE_URL`, `/account` shows an honest
"accounts aren't connected yet" notice and the auth routes return 503 —
browsing and guest checkout are unaffected.

Orders placed while signed in get `Order.userId` set so they appear in
order history; guest orders leave it null.

### 5. Admin dashboard

`/admin` is the store owner's UI for the order/fulfilment work the raw
`x-admin-key` API otherwise requires a script or Postman for. It reuses
`ADMIN_API_KEY` as its password — nothing new to configure. Sign in at
`/admin/login`; the session is a short-lived (12h), signed httpOnly cookie
verified server-side on every protected page and Server Action (never via
proxy/middleware alone, per Next.js's own guidance not to rely on Proxy for
authorization).

- `/admin` — recent orders with payment/fulfilment status and a filter row.
- `/admin/orders/[id]` — full order detail: customer, address, items,
  payment info, event history, and per-channel notification log (sent /
  skipped / failed, with the reason) — the fastest way to see whether a
  WhatsApp or email actually went out.
- Fulfilment form — status, courier, tracking number/URL, internal notes
  (never shown to the customer). Changing status calls the same
  `applyFulfilmentStatus` the raw API uses, so it records history and
  triggers WhatsApp/email identically. Marking **Shipped** without a
  courier name on file is rejected client-side, before any request is
  sent — an admin who fixes it and resubmits isn't relying on the browser
  remembering their dropdown choice through a round-trip.
- Refund — shown once an order is Paid. Calls Razorpay's refund API
  directly, then moves the order to `REFUND_PENDING`; the `refund.processed`
  webhook confirms `REFUNDED` once Razorpay does. Hidden with an honest
  notice if Razorpay isn't configured yet.
- Payment status override — collapsed by default, for correcting the
  record after something was resolved directly in the Razorpay dashboard.
  Gateway webhooks remain the normal path; this never charges or refunds
  anything itself.

Customer chrome (header, announcement bar, footer, floating WhatsApp
button) is hidden on every `/admin` route — it's an internal tool, not
storefront.

### 6. Order confirmation

`/order-success` reads the order's persisted `paymentStatus` — set by
`/api/payments/razorpay/verify` (signature-checked) before the redirect
happens — never anything derived from the URL itself. It clears the
persistent cart only for a cart-mode checkout; a Buy Now purchase never
touches cart items the customer didn't check out.

## Contact and WhatsApp

The business email and phone/WhatsApp number live in `src/data/contact.ts`
and are the single source for the footer, the contact page, the floating
WhatsApp button, and the "Order via WhatsApp" option in the cart. Change
them there only. `whatsappLink(message?)` builds `wa.me` deep links;
`src/lib/whatsapp-order.ts` builds the prefilled cart-order message so
shoppers can order over chat as an alternative to on-site checkout.

## Wishlist

Saved products live in `localStorage` (`src/lib/wishlist-context.tsx`), so
the wishlist works with no account and no database. It stores slugs only and
resolves them against `src/data/products.ts` at render time — nothing to keep
in sync, and a removed product simply drops out of `/wishlist`.

## Brand assets

Any image slot without a real file renders a deliberate botanical placeholder
(a soft gradient card with a line-art sprig and caption) instead of a broken
image or an invented photo — drop a real file in at the expected path and it
appears with no code changes.

The real logo (`public/images/brand/logo.png`, also used for `logo-dark.png`,
`src/app/icon.png` and `src/app/apple-icon.png`) is supplied — it's a
self-contained circular badge, so one file works over both light and dark
backgrounds.

**Still placeholder:**

| What | Path |
| --- | --- |
| Additional product angles | `public/images/products/<slug>-2.jpg`, `-3.jpg` |
| Our Story editorial photo | `public/images/kashmir/story-editorial.jpg` |

Product slugs are listed in `src/data/products.ts`; combo slugs in
`src/data/combos.ts`.

## Structure

```
app/            Routes: home, /shop, /products/[slug], /rituals, /our-story,
                /contact, /checkout, /order-success, /track/[token],
                /account, /wishlist, /shipping, /returns, /privacy, /terms,
                /admin (store-owner dashboard), api/*
components/     Reusable UI (Header, ProductCard, CartDrawer, SmartImage, ...)
data/           Product, combo, ingredient, navigation, shipping, tax, coupon data
lib/            Cart context, search, formatting, payment provider abstraction
lib/payment/    PaymentProvider interface + the Razorpay Checkout implementation
lib/notifications/  WhatsApp + email dispatch, shared by webhook and admin routes
lib/orders/     applyPaymentStatus/applyFulfilmentStatus — the only place
                order status transitions and history are written
lib/admin-auth.ts   /admin dashboard session (reuses ADMIN_API_KEY)
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
