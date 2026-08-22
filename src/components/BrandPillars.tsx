import Link from "next/link";

const pillars = [
  { title: "Organic & Botanical", href: "/shop" },
  { title: "Cruelty-Free", href: "/our-story" },
  { title: "Handcrafted in Kashmir", href: "/our-story" },
  { title: "Ships Across India", href: "/shipping" },
];

export default function BrandPillars() {
  return (
    <section className="border-b border-gold/15 bg-ivory" aria-label="Brand assurances">
      <div className="mx-auto flex max-w-standard flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-5 sm:px-8 lg:gap-x-7 lg:py-6">
        {pillars.map((pillar, index) => (
          <div key={pillar.title} className="flex items-center gap-x-4 lg:gap-x-7">
            {index > 0 && (
              <span aria-hidden="true" className="hidden h-1 w-1 rotate-45 border border-gold/60 sm:block" />
            )}
            <Link
              href={pillar.href}
              className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-walnut/70 transition-colors duration-200 hover:text-burgundy sm:text-[0.72rem]"
            >
              {pillar.title}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
