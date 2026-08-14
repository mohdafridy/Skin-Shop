import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, products } from "@/data/products";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import Accordion from "@/components/Accordion";
import ProductGrid from "@/components/ProductGrid";
import SectionHeading from "@/components/SectionHeading";
import { absoluteUrl, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const url = absoluteUrl(`/products/${product.slug}`);
  const image = absoluteUrl(product.image);

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url,
      images: [{ url: image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription,
      images: [image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const gallery = product.gallery ?? [product.image];

  const jsonLd = productJsonLd(product);
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: product.shortName ?? product.name, path: `/products/${product.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:px-8 lg:pb-16 lg:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <nav className="mb-8 text-sm text-walnut/70" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-burgundy">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.shortName ?? product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <ProductGallery images={gallery} productName={product.name} />

        <div>
          <ProductInfo product={product} />

          <div className="mt-10">
            <Accordion title="The Ritual" defaultOpen>
              <p>
                {product.tagline}.
                {product.ritualTags && product.ritualTags.length > 0
                  ? ` A ${product.ritualTags.join(" & ").toLowerCase()} step in your routine.`
                  : ""}
              </p>
            </Accordion>

            <Accordion title="Product Story">
              <p>{product.description}</p>
            </Accordion>

            {product.ritual && product.ritual.length > 0 && (
              <Accordion title="How To Use">
                <ol className="list-decimal space-y-2 pl-5">
                  {product.ritual.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </Accordion>
            )}

            {product.ingredients && product.ingredients.length > 0 && (
              <Accordion title="Ingredients">
                <p>{product.ingredients.join(", ")}</p>
              </Accordion>
            )}

            <Accordion title="Shipping">
              <p>
                We aim to dispatch orders promptly. Shipping options and delivery
                estimates for your location are shown at checkout.
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeading eyebrow="Continue The Ritual" title="You May Also Like" />
          <div className="mt-10">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
