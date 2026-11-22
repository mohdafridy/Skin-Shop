/**
 * Provisions an empty database with the original Skin Shop catalog.
 * It never overwrites a product edited by an administrator — Postgres now
 * supplies the authoritative product prices, names and availability to both
 * the storefront and checkout. See ADMIN_CATALOG_SETUP.md.
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
      // Never overwrite admin edits (name, price, image or availability) on re-seed.
      update: {},
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
