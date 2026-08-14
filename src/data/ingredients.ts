import { HUSN_E_YUSUF, ARK_E_GULAAB } from "@/lib/proper-nouns";

export type IngredientStory = {
  id: string;
  name: string;
  story: string;
  relatedProductSlugs: string[];
  /** Dedicated raw-material photo, for ingredients with no linked product
   * to borrow an image from. Optional — falls back to the first related
   * product's image, then to the BotanicalMark placeholder. */
  image?: string;
};

export const ingredientStories: IngredientStory[] = [
  {
    id: "saffron",
    name: "Saffron",
    story:
      "Grown in the fields of Kashmir and gathered by hand, saffron is one of the region's most treasured blooms — prized for generations in beauty ritual for its warmth, colour and scent. In the Saffron Gel, it becomes a golden, everyday indulgence.",
    relatedProductSlugs: ["saffron-gel"],
    image: "/images/ingredients/saffron.jpg",
  },
  {
    id: "rose",
    name: "Rose",
    story:
      `Rose has long sat at the centre of Kashmiri beauty tradition — distilled into water, worked into soap, carried on the air of a garden in bloom. Sun-dried Bulgarian rose petals are among the botanicals prepared for the collection, appearing in ${ARK_E_GULAAB} and the ${HUSN_E_YUSUF} ritual, softening the everyday routine.`,
    relatedProductSlugs: [
      "ark-e-gulaab",
      "husn-e-yusuf-whitening-soap-cleanser",
      "husn-e-yusuf-exfoliator",
    ],
  },
  {
    id: "hibiscus",
    name: "Hibiscus",
    story:
      "Sun-dried hibiscus flowers are prepared alongside rose and saffron as part of The Skin Shop's botanical raw materials — a bloom with its own long-standing place in skin and hair care tradition.",
    relatedProductSlugs: [],
    image: "/images/ingredients/hibiscus.jpg",
  },
  {
    id: "rosemary",
    name: "Rosemary",
    story:
      "A herb long kept in kitchen gardens and passed down through hair care tradition, rosemary finds a modern format in our hair serum — worked through the scalp and lengths as part of a weekly ritual.",
    relatedProductSlugs: ["rosemary-hair-serum"],
  },
  {
    id: "moringa",
    name: "Moringa",
    story:
      "Valued across generations for its fresh, green character, moringa lends the Moringa Cleanser its distinctive botanical note — a bright start to the daily routine.",
    relatedProductSlugs: ["moringa-whitening-soap-cleanser"],
  },
  {
    id: "argan",
    name: "Argan",
    story:
      "Long prized in body care tradition for its rich, warming texture, argan is the foundation of our body cream — a generous formula built for daily use.",
    relatedProductSlugs: ["argan-body-whitening-cream"],
  },
  {
    id: "coffee",
    name: "Coffee",
    story:
      "Coffee's deep, earthy character has a history beyond the cup, gathered here into a weekly mask ritual — a short, grounding pause in a busy week.",
    relatedProductSlugs: ["coffee-detox-facemask"],
  },
  {
    id: "jojoba",
    name: "Jojoba",
    story:
      "Known for its gentle character, jojoba is formulated with a lighter touch for the smallest members of the family, in a soap designed for children's daily wash routines.",
    relatedProductSlugs: ["jojoba-kids-soap"],
  },
  {
    id: "shea",
    name: "Shea",
    story:
      "Reached for again and again, shea is the quiet workhorse of body and lip care tradition — the foundation of a lip balm designed to travel everywhere with you.",
    relatedProductSlugs: ["shea-lip-balm"],
  },
  {
    id: "vitamin-c",
    name: "Vitamin C",
    story:
      "A familiar name in contemporary skincare, Vitamin C is formulated here into a lightweight serum designed to sit at the start of a brightening morning routine.",
    relatedProductSlugs: ["vitamin-c-serum"],
  },
  {
    id: "solar-infusion",
    name: "Solar Infusion",
    story:
      "Some herbal formulations are prepared using a traditional solar-infusion process: jars set outdoors in sunlight through the day and brought back in each evening, repeated for around 40 days — a slow, hands-on part of how the collection is made.",
    relatedProductSlugs: [],
  },
];
