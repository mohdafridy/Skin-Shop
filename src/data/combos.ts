import { getProductBySlug } from "./products";

export type Combo = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  mood: string;
  description: string;
  image: string;
  /** Locked commercial price for the bundle. INR, numeric. */
  price: number;
  currency: string;
  productSlugs: string[];
};

/**
 * All three combos' names, contents and prices are locked commercial data
 * from the business, confirmed against the real product line-up.
 */
export const combos: Combo[] = [
  {
    id: "moonlight",
    slug: "moonlight-combo",
    name: "Moonlight Combo",
    tagline: "An evening ritual for cleansing, nourishment and night care",
    mood: "Moonlight · Candlelight · Intimate · Restorative · Regal",
    description:
      "Brought together for the last hour of the day: a rose cleanse followed by Dahab's rich, golden night cream. Two steps, unhurried, before sleep.",
    image: "/images/combos/moonlight-combo.jpg",
    price: 1250,
    currency: "INR",
    productSlugs: ["husn-e-yusuf-whitening-soap-cleanser", "dahab-whitening-night-cream"],
  },
  {
    id: "snowglow",
    slug: "snowglow-combo",
    name: "Snowglow Combo",
    tagline: "A brightening ritual bringing together cleansing, nourishment and Vitamin C care",
    mood: "Morning light · Golden glow · Floral · Luminous",
    description:
      "A sequence built for brightness: a rose cleanse, Dahab's nourishing night cream, and Vitamin C to finish. Warm, floral and glowing.",
    image: "/images/combos/snowglow-combo.jpg",
    price: 1850,
    currency: "INR",
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
      "A basketful of favourites spanning cleanse, mist, night care and a weekly mask, gathered together for a fuller everyday ritual.",
    image: "/images/combos/radiance-ritual-combo.jpg",
    price: 1900,
    currency: "INR",
    productSlugs: [
      "husn-e-yusuf-whitening-soap-cleanser",
      "ark-e-gulaab",
      "dahab-whitening-night-cream",
      "coffee-detox-facemask",
    ],
  },
];

export function getComboBySlug(slug: string): Combo | undefined {
  return combos.find((c) => c.slug === slug);
}

export type ComboPricing = {
  /** Sum of the constituent products' individual prices — the canonical
   * product prices are the only source for this; never hard-code it. */
  individualValue: number;
  price: number;
  savings: number;
  currency: string;
};

export function getComboPricing(combo: Combo): ComboPricing {
  const individualValue = combo.productSlugs.reduce((sum, slug) => {
    const product = getProductBySlug(slug);
    return sum + (product?.price ?? 0);
  }, 0);

  return {
    individualValue,
    price: combo.price,
    savings: individualValue - combo.price,
    currency: combo.currency,
  };
}
