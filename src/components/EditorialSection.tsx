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
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-32">
      <SectionHeading
        eyebrow="A World, Not Just A Product"
        title="Ritual, Material, Place"
        center
      />
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile, i) => (
          <Reveal
            key={tile.src}
            variant="image"
            delay={i * 70}
            className={`overflow-hidden rounded-2xl ${i === 0 || i === 3 ? "lg:col-span-2" : ""}`}
          >
            <SmartImage
              src={tile.src}
              alt={tile.label}
              label={tile.label}
              className={`rounded-2xl ${i === 0 || i === 3 ? "aspect-[8/5]" : "aspect-square"}`}
              sizes="(min-width: 1024px) 45vw, 45vw"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
