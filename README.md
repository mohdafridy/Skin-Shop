# Petal & Skin — Skin Shop

A skincare e-commerce storefront built with Next.js (App Router) and Supabase.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Tailwind CSS v4** for styling
- **Supabase** (Postgres + PostgREST) for products, categories, and orders

## Features

- Product catalog with category filtering (`/shop`)
- Product detail pages with related products (`/product/[slug]`)
- Client-side cart (persisted to `localStorage`)
- Guest checkout that verifies prices server-side and writes orders to Supabase (`/checkout`)
- Order confirmation page (`/order-confirmation/[orderNumber]`)

## Getting started

```bash
npm install
cp .env.example .env.local  # fill in your Supabase project URL + anon/publishable key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

The schema (`categories`, `products`, `orders`, `order_items`) and seed data live in
Supabase migrations. Row Level Security is enabled: anonymous users can read
`categories`/`products` and create `orders`/`order_items`, but cannot mutate
existing catalog data.
