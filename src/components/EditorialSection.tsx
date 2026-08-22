import SmartImage from "./SmartImage";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const tiles = [
  { src: "/images/kashmir/saffron-fields.jpg", label: "Saffron harvest, Kashmir" },
  { src: "/images/kashmir/rose-garden.jpg", label: "Rose garden" },
  { src: "/images/kashmir/textile-craft.jpg", label: "Traditional textile and craft detail" },
  { src: "/images/kashmir/brass-textile.jpg", label: "Hand-blending botanical oils, Kashmir" },
];

export default function EditorialSection() {
  return (
    <section className="chapter-section mx-auto max-w-wide px-6 py-[var(--space-section-lg)] sm:px-8">
      <div className="max-w-3xl">
        <SectionHeading
          eyebrow="Craftsmanship"
          title="The Craft Behind the Care"
          subtitle="From the ingredients we choose to the textures, fragrances and finishing touches, every detail is considered to make everyday skincare feel a little more special."
          size="large"
        />
      </div>
      <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-12 lg:gap-6">
        {tiles.map((tile, i) => {
          const layout =
            i === 0
              ? "lg:col-span-5"
              : i === 1
                ? "lg:col-span-3 lg:mt-16"
                : i === 2
                  ? "lg:col-span-4 lg:mt-8"
                  : "lg:col-span-7 lg:col-start-6";
          const aspect = i === 0 || i === 3 ? "aspect-[5/4]" : "aspect-[4/5]";
          return (
            <Reveal key={tile.src} variant="image" delay={i * 70} className={`overflow-hidden ${layout}`}>
              <SmartImage
                src={tile.src}
                alt={tile.label}
                label={tile.label}
                className={aspect}
                sizes="(min-width: 1024px) 42vw, 46vw"
                imageClassName="transition-transform duration-[850ms] ease-premium hover:scale-[1.018]"
              />
              <p className="mt-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-walnut/45">{tile.label}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
