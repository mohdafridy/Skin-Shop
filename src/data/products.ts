export type ProductCollection = "Skin" | "Hair" | "Body" | "Kids" | "Lip Care";

export type RitualTag = "Cleanse" | "Treat" | "Hydrate" | "Exfoliate" | "Hair" | "Body" | "Family Care";

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  category: string;
  collection: ProductCollection;
  ritualTags?: RitualTag[];
  tagline: string;
  shortDescription: string;
  description: string;
  image: string;
  gallery?: string[];
  price?: number;
  currency?: string;
  size?: string;
  ingredients?: string[];
  ritual?: string[];
  featured?: boolean;
  bestseller?: boolean;
  related?: string[];
};

// Non-breaking spaces keep this three-word proper noun from splitting across
// a line break (e.g. "Husn e" / "Yusuf Cleanser") at narrow widths.
const HUSN_E_YUSUF = "Husn e Yusuf";

function productImages(slug: string, count = 3): string[] {
  return Array.from({ length: count }, (_, i) =>
    i === 0 ? `/images/products/${slug}.jpg` : `/images/products/${slug}-${i + 1}.jpg`,
  );
}

export const products: Product[] = [
  {
    id: "husn-e-yusuf-cleanser",
    slug: "husn-e-yusuf-whitening-soap-cleanser",
    name: `${HUSN_E_YUSUF} Whitening Soap Cleanser`,
    shortName: `${HUSN_E_YUSUF} Cleanser`,
    category: "Face Cleanser",
    collection: "Skin",
    ritualTags: ["Cleanse"],
    tagline: "A rose ritual, in a single bar",
    shortDescription: "A gentle, rose-scented cleansing soap for daily skin care.",
    description:
      "Husn e Yusuf carries forward a beauty ritual long associated with rose and softness. Lathered into a light foam, it lifts away the day and leaves skin feeling calm and clean — a first step worth slowing down for.",
    image: productImages("husn-e-yusuf-whitening-soap-cleanser")[0],
    gallery: productImages("husn-e-yusuf-whitening-soap-cleanser"),
    ritual: [
      "Wet the face with lukewarm water.",
      "Work the bar into a soft lather between your hands.",
      "Massage gently over the face in circular motions.",
      "Rinse thoroughly and pat dry.",
    ],
    featured: true,
    bestseller: true,
    related: [
      "husn-e-yusuf-exfoliator",
      "ark-e-gulaab",
      "dahab-whitening-night-cream",
    ],
  },
  {
    id: "dahab-night-cream",
    slug: "dahab-whitening-night-cream",
    name: "Dahab Whitening Night Cream",
    shortName: "Dahab Night Cream",
    category: "Night Cream",
    collection: "Skin",
    ritualTags: ["Hydrate"],
    tagline: "A golden ritual for the night",
    shortDescription: "A rich night cream to close the day's routine.",
    description:
      "Dahab — meaning gold — is formulated as the last step of an evening routine, applied after cleansing to comfort the skin overnight. Its texture is generous and warming: a small ritual of care before sleep.",
    image: productImages("dahab-whitening-night-cream")[0],
    gallery: productImages("dahab-whitening-night-cream"),
    ritual: [
      "Apply after cleansing and toning, as the final step of your evening routine.",
      "Smooth a small amount over the face and neck.",
      "Massage gently until absorbed.",
      "Use nightly as part of your evening ritual.",
    ],
    featured: true,
    bestseller: true,
    related: [
      "husn-e-yusuf-whitening-soap-cleanser",
      "ark-e-gulaab",
      "saffron-gel",
    ],
  },
  {
    id: "ark-e-gulaab",
    slug: "ark-e-gulaab",
    name: "Ark e Gulaab",
    category: "Rose Mist",
    collection: "Skin",
    ritualTags: ["Hydrate"],
    tagline: "Rose water, distilled simply",
    shortDescription: "A fine rose mist for freshness throughout the day.",
    description:
      "Ark e Gulaab is a traditional rose water, valued for generations as a simple way to refresh and soften the skin. Kept close to the dressing table, it is misted on whenever the day calls for a small moment of coolness.",
    image: productImages("ark-e-gulaab")[0],
    gallery: productImages("ark-e-gulaab"),
    ritual: [
      "Shake gently before use.",
      "Mist evenly over clean skin, or over makeup to refresh.",
      "Allow to settle naturally, or pat in gently.",
      "Use morning, midday or evening, as needed.",
    ],
    featured: true,
    bestseller: true,
    related: ["husn-e-yusuf-whitening-soap-cleanser", "saffron-gel", "vitamin-c-serum"],
  },
  {
    id: "vitamin-c-serum",
    slug: "vitamin-c-serum",
    name: "Vitamin C Serum",
    category: "Face Serum",
    collection: "Skin",
    ritualTags: ["Treat"],
    tagline: "Brightness, bottled",
    shortDescription: "A lightweight Vitamin C serum for the morning routine.",
    description:
      "Formulated around Vitamin C, this serum is designed to sit lightly under moisturizer as part of a brightening morning routine. A few drops go a long way, absorbing quickly into clean skin.",
    image: productImages("vitamin-c-serum")[0],
    gallery: productImages("vitamin-c-serum"),
    ritual: [
      "Apply to clean, dry skin.",
      "Smooth a few drops evenly over the face.",
      "Allow to absorb before layering moisturizer or sunscreen.",
      "Use in the morning as part of your routine.",
    ],
    featured: true,
    bestseller: true,
    related: ["ark-e-gulaab", "dahab-whitening-night-cream", "saffron-gel"],
  },
  {
    id: "rosemary-hair-serum",
    slug: "rosemary-hair-serum",
    name: "Rosemary Hair Serum",
    category: "Hair Serum",
    collection: "Hair",
    ritualTags: ["Hair"],
    tagline: "An old herb, a modern format",
    shortDescription: "A rosemary hair serum for the scalp and lengths.",
    description:
      "Rosemary has long held a place in hair care traditions, and this serum brings it into a modern, easy-to-use format. Worked through the scalp and lengths, it fits naturally into a weekly hair routine.",
    image: productImages("rosemary-hair-serum")[0],
    gallery: productImages("rosemary-hair-serum"),
    ritual: [
      "Apply a small amount directly to the scalp or lengths.",
      "Massage gently with fingertips.",
      "Use on dry or towel-dried hair.",
      "Incorporate into your regular hair routine, a few times a week.",
    ],
    related: ["moringa-whitening-soap-cleanser", "jojoba-kids-soap"],
  },
  {
    id: "coffee-detox-facemask",
    slug: "coffee-detox-facemask",
    name: "Coffee Detox Facemask",
    category: "Face Mask",
    collection: "Skin",
    ritualTags: ["Treat"],
    tagline: "An earthy pause, once a week",
    shortDescription: "A coffee-based face mask for a weekly reset.",
    description:
      "Coffee Detox brings the deep, earthy character of coffee into a weekly face mask ritual. Applied to clean skin and rinsed away after a short pause, it is a small ceremony of stillness in a busy week.",
    image: productImages("coffee-detox-facemask")[0],
    gallery: productImages("coffee-detox-facemask"),
    ritual: [
      "Apply an even layer to clean, dry skin, avoiding the eye area.",
      "Leave on for around 10–15 minutes.",
      "Rinse thoroughly with lukewarm water.",
      "Use once or twice a week.",
    ],
    related: ["husn-e-yusuf-exfoliator", "argan-body-whitening-cream"],
  },
  {
    id: "moringa-cleanser",
    slug: "moringa-whitening-soap-cleanser",
    name: "Moringa Whitening Soap Cleanser",
    shortName: "Moringa Cleanser",
    category: "Face Cleanser",
    collection: "Skin",
    ritualTags: ["Cleanse"],
    tagline: "Green botanicals, every morning",
    shortDescription: "A moringa-infused cleansing soap with a fresh, green character.",
    description:
      "Moringa lends this cleansing bar its fresh, green botanical character. Designed for daily use, it lathers gently and rinses clean, leaving skin ready for the rest of the routine.",
    image: productImages("moringa-whitening-soap-cleanser")[0],
    gallery: productImages("moringa-whitening-soap-cleanser"),
    ritual: [
      "Wet the face with lukewarm water.",
      "Work into a gentle lather.",
      "Massage over the skin, avoiding the eye area.",
      "Rinse thoroughly and pat dry.",
    ],
    related: ["vitamin-c-serum", "ark-e-gulaab", "husn-e-yusuf-whitening-soap-cleanser"],
  },
  {
    id: "argan-body-cream",
    slug: "argan-body-whitening-cream",
    name: "Argan Body Whitening Cream",
    shortName: "Argan Body Cream",
    category: "Body Cream",
    collection: "Body",
    ritualTags: ["Body"],
    tagline: "Warmth for the whole body",
    shortDescription: "A nourishing argan body cream for daily use.",
    description:
      "Built around argan, long prized in body care traditions, this cream is formulated for daily use across the body. Its warm, generous texture is designed to sink in without leaving skin feeling heavy.",
    image: productImages("argan-body-whitening-cream")[0],
    gallery: productImages("argan-body-whitening-cream"),
    ritual: [
      "Apply to clean, dry skin after bathing.",
      "Massage in upward, circular motions until absorbed.",
      "Focus on drier areas such as elbows, knees and heels.",
      "Use daily as part of your body care routine.",
    ],
    related: ["shea-lip-balm", "coffee-detox-facemask"],
  },
  {
    id: "jojoba-kids-soap",
    slug: "jojoba-kids-soap",
    name: "Jojoba Kids Soap",
    category: "Kids Soap",
    collection: "Kids",
    ritualTags: ["Family Care"],
    tagline: "Gentle enough for little routines",
    shortDescription: "A gentle jojoba soap formulated for children.",
    description:
      "Jojoba Kids Soap is formulated with a lighter touch, designed for children's daily wash routines — simple and gentle enough to build into a family bath-time habit.",
    image: productImages("jojoba-kids-soap")[0],
    gallery: productImages("jojoba-kids-soap"),
    ritual: [
      "Wet the skin with lukewarm water.",
      "Lather gently in hands before applying.",
      "Use during bath time as part of a child's daily wash.",
      "Rinse thoroughly. Adult supervision is recommended for young children.",
    ],
    related: ["shea-lip-balm", "rosemary-hair-serum"],
  },
  {
    id: "shea-lip-balm",
    slug: "shea-lip-balm",
    name: "Shea Lip Balm",
    category: "Lip Balm",
    collection: "Lip Care",
    tagline: "A small comfort, kept close",
    shortDescription: "A shea-based lip balm for everyday softness.",
    description:
      "Small enough for a pocket or bag, this shea-based lip balm is designed to be reached for throughout the day — a small, quiet act of care.",
    image: productImages("shea-lip-balm")[0],
    gallery: productImages("shea-lip-balm"),
    ritual: [
      "Apply to lips as needed throughout the day.",
      "Reapply after eating, drinking or exposure to wind and cold.",
    ],
    related: ["argan-body-whitening-cream", "jojoba-kids-soap"],
  },
  {
    id: "husn-e-yusuf-exfoliator",
    slug: "husn-e-yusuf-exfoliator",
    name: `${HUSN_E_YUSUF} Exfoliator`,
    category: "Exfoliator",
    collection: "Skin",
    ritualTags: ["Exfoliate"],
    tagline: "Rose, in a softer form",
    shortDescription: "A gentle exfoliating companion to the Husn e Yusuf cleanser.",
    description:
      "An exfoliating extension of the Husn e Yusuf ritual, formulated to be worked gently over the skin a few times a week — designed to sit alongside, rather than replace, your regular cleanser.",
    image: productImages("husn-e-yusuf-exfoliator")[0],
    gallery: productImages("husn-e-yusuf-exfoliator"),
    ritual: [
      "Apply to damp skin.",
      "Massage gently in small, circular motions, avoiding the eye area.",
      "Rinse thoroughly with lukewarm water.",
      "Use two to three times a week, rather than daily.",
    ],
    related: ["husn-e-yusuf-whitening-soap-cleanser", "coffee-detox-facemask"],
  },
  {
    id: "saffron-gel",
    slug: "saffron-gel",
    name: "Saffron Gel",
    category: "Face Gel",
    collection: "Skin",
    ritualTags: ["Treat"],
    tagline: "Kashmir's most treasured bloom",
    shortDescription: "A saffron-infused face gel, formulated in the spirit of Kashmir.",
    description:
      "Saffron — grown in the fields of Kashmir and gathered by hand — is the centrepiece of this lightweight gel. Golden in tone and cooling in texture, it is formulated as an indulgent step within a broader skincare ritual.",
    image: productImages("saffron-gel")[0],
    gallery: productImages("saffron-gel"),
    ritual: [
      "Apply a thin, even layer to clean skin.",
      "Allow to absorb fully before layering other products.",
      "Use as often as fits your routine.",
    ],
    bestseller: true,
    related: ["ark-e-gulaab", "vitamin-c-serum", "dahab-whitening-night-cream"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product): Product[] {
  if (!product.related) return [];
  return product.related
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is Product => Boolean(p));
}

export const collections: ProductCollection[] = ["Skin", "Hair", "Body", "Kids", "Lip Care"];

export const categories: string[] = Array.from(new Set(products.map((p) => p.category)));
