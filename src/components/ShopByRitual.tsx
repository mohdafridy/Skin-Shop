import Link from "next/link";
import { ritualCategories } from "@/data/rituals";
import { getProductBySlug } from "@/data/products";
import SectionHeading from "./SectionHeading";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";

export default function ShopByRitual() {
  return (
    <section className="bg-sand/50 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <SectionHeading eyebrow="Shop By Desire" title="What Are You In The Mood For?" center />

        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {ritualCategories.map((ritual, i) => {
            const product = getProductBySlug(ritual.representativeSlug);
            return (
              <Reveal key={ritual.name} delay={(i % 4) * 60}>
                <Link
                  href={`/shop?ritual=${encodeURIComponent(ritual.filterValues.join(","))}`}
                  className="group block overflow-hidden rounded-2xl"
                >
                  <SmartImage
                    src={product?.image ?? ""}
                    alt={ritual.name}
                    label={ritual.name}
                    className="aspect-square rounded-2xl"
                    sizes="(min-width: 640px) 30vw, 45vw"
                    imageClassName="transition duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="mt-3">
                    <h3 className="font-display text-lg text-ink">{ritual.name}</h3>
                    <p className="mt-0.5 text-balance text-xs leading-snug text-walnut/70">
                      {ritual.description}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
