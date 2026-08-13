/**
 * Seeds the database from the site's real, locked catalog — src/data/products.ts
 * and src/data/combos.ts — rather than placeholder data. Those two files stay
 * the source of truth for display; this script just mirrors them into
 * Postgres so checkout has a trusted, server-side price to re-validate
 * against (never the browser's).
 */
import { PrismaClient } from "@prisma/client";
import { products } from "../src/data/products";
import { combos } from "../src/data/combos";

const prisma = new PrismaClient();

async function main() {
  const productIdBySlug = new Map<string, string>();

  for (const p of products) {
    const row = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        shortName: p.shortName ?? null,
        category: p.category,
        collection: p.collection,
        price: p.price,
        currency: p.currency,
        image: p.image,
        active: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        shortName: p.shortName ?? null,
        category: p.category,
        collection: p.collection,
        price: p.price,
        currency: p.currency,
        image: p.image,
        active: true,
      },
    });
    productIdBySlug.set(p.slug, row.id);
  }

  for (const c of combos) {
    const row = await prisma.combo.upsert({
      where: { slug: c.slug },
      update: { name: c.name, price: c.price, currency: c.currency, image: c.image, active: true },
      create: { slug: c.slug, name: c.name, price: c.price, currency: c.currency, image: c.image, active: true },
    });

    for (const productSlug of c.productSlugs) {
      const productId = productIdBySlug.get(productSlug);
      if (!productId) continue;
      await prisma.comboItem.upsert({
        where: { comboId_productId: { comboId: row.id, productId } },
        update: {},
        create: { comboId: row.id, productId, quantity: 1 },
      });
    }
  }

  // No coupons are seeded — none are active on the live site yet
  // (see src/data/coupons.ts). Add real ones here only once the business
  // supplies them.
}

main()
  .then(() => console.log(`Seeded ${products.length} products and ${combos.length} combos.`))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
