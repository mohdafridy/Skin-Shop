# Skin Shop â€” Admin product editor

The Products section at /admin/products lets a signed-in store administrator:
- Create products and choose whether they are published.
- Edit names, categories, collections, INR prices, descriptions, ingredients,
  benefits, usage instructions, gallery URLs and related products.
- Upload product photographs to Vercel Blob, or paste an HTTPS image URL.
- Manage limited/unlimited stock and show or hide products.

## Safe rollout

1. Apply the **additive** Prisma migration to the target database **before**
   enabling edits in that environment, after taking a database backup:
   npx prisma migrate deploy
2. For uploading images, connect a **public Vercel Blob** store to the Vercel
   project (Project â†’ Storage â†’ Blob). Vercel sets BLOB_READ_WRITE_TOKEN.
   Redeploy after connecting. Without Blob, admins may still paste an existing
   /images/... path or HTTPS image URL.
3. Ensure DATABASE_URL and ADMIN_API_KEY are configured in the appropriate
   environment. Never paste either secret into source control.
4. Sign in at /admin/login, open Products, click Add product or Edit details.
5. For preview testing, use an isolated preview database rather than
   connecting the preview to live customer/order data.
6. Do not run the legacy seed as a migration. It now preserves existing product
   edits (upsert with empty update), and is only for initial catalog rows.

## How storefront prices work

PostgreSQL Product rows are the authoritative names¶»§q«^