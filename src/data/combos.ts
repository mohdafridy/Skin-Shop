export type Combo = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  mood: string;
  description: string;
  image: string;
  productSlugs: string[];
};

/**
 * All three combos' names, contents and photos are confirmed against the
 * real product line-up.
 */
export const combos: Combo[] = [
  {
    id: "moon-light",
    slug: "moon-light-combo",
    name: "Moon Light Combo",
    tagline: "An evening ritual for cleansing, nourishment and night care",
    mood: "Moonlight · Candlelight · Intimate · Restorative · Regal",
    description:
      "Brought together for the last hour of the day: a rose cleanse followed by Dahab's rich, golden night cream. Two steps, unhurried, before sleep.",
    image: "/images/combos/moon-light-combo.jpg",
    productSlugs: ["husn-e-yusuf-whitening-soap-cleanser", "dahab-whitening-night-cream"],
  },
  {
    id: "sun-glow",
    slug: "sun-glow-combo",
    name: "Sun Glow Combo",
    tagline: "A brightening ritual bringing together cleansing, nourishment and Vitamin C care",
    mood: "Morning light · Golden glow · Floral · Luminous",
    description:
      "A sequence built for brightness: a rose cleanse, Dahab's nourishing night cream, and Vitamin C to finish. Warm, floral and glowing.",
    image: "/images/combos/sun-glow-combo.png",
    productSlugs: [
      "husn-e-yusuf-whitening-soap-cleanser",
      "dahab-whitening-night-cream",
      "vitamin-c-serum",
    ],
  },
  {
    id: "radiance-ritual",
    slug: "radiance-ritual-combo",
    name: "Radiance Ritual Combo",
    tagline: "Several Skin Shop favourites, gathered into one fuller ritual",
    mood: "Garden · Basket · Botanical abundance · Everyday ritual",
    description:
      "For anyone who wants to experience more of The Skin Shop at once — a basketful of favourites spanning cleanse, mist, night care and a weekly mask, gathered for an everyday ritual.",
    image: "/images/combos/radiance-ritual-combo.png",
    productSlugs: [
      "husn-e-yusuf-whitening-soap-cleanser",
      "ark-e-gulaab",
      "coffee-detox-facemask",
      "dahab-whitening-night-cream",
      "saffron-gel",
    ],
  },
];

export function getComboBySlug(slug: string): Combo | undefined {
  return combos.find((c) => c.slug === slug);
}
