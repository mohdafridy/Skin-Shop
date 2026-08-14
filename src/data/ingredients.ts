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
      "Grown in the fields of Kashmir and gathered by hand, saffron is rich in antioxidants like crocin, known for helping protect skin from environmental stress and supporting a brighter, more even-looking tone. Long prized in beauty ritual for its warmth and colour, it becomes a golden, everyday indulgence in the Saffron Gel.",
    relatedProductSlugs: ["saffron-gel"],
    image: "/images/ingredients/saffron.jpg",
  },
  {
    id: "rose",
    name: "Rose",
    story:
      `Rose has long sat at the centre of Kashmiri beauty tradition — distilled into water, worked into soap, carried on the air of a garden in bloom. Its natural antioxidants and mild anti-inflammatory properties help calm the skin and support a soothed, balanced complexion, appearing in ${ARK_E_GULAAB} and the ${HUSN_E_YUSUF} ritual.`,
    relatedProductSlugs: [
      "ark-e-gulaab",
      "husn-e-yusuf-whitening-soap-cleanser",
      "husn-e-yusuf-exfoliator",
    ],
    image: "/images/ingredients/rose.jpg",
  },
  {
    id: "hibiscus",
    name: "Hibiscus",
    story:
      "Sun-dried hibiscus flowers are prepared alongside rose and saffron as part of The Skin Shop's botanical raw materials. Rich in antioxidants and natural fruit acids, hibiscus is valued for gently supporting skin's texture and brightness — a bloom with its own long-standing place in skin and hair care tradition.",
    relatedProductSlugs: [],
    image: "/images/ingredients/hibiscus.jpg",
  },
  {
    id: "rosemary",
    name: "Rosemary",
    story:
      "A herb long kept in kitchen gardens and passed down through hair care tradition, rosemary is known for helping support scalp circulation and a healthier-looking scalp. It finds a modern format in our hair serum — worked through the scalp and lengths as part of a weekly ritual.",
    relatedProductSlugs: ["rosemary-hair-serum"],
    image: "/images/ingredients/rosemary.jpg",
  },
  {
    id: "moringa",
    name: "Moringa",
    story:
      "Valued across generations for its fresh, green character, moringa is rich in vitamins C and E and natural antioxidants that help support skin's moisture barrier and a clearer-looking complexion. It lends the Moringa Cleanser its distinctive botanical note — a bright start to the daily routine.",
    relatedProductSlugs: ["moringa-whitening-soap-cleanser"],
    image: "/images/ingredients/moringa.jpg",
  },
  {
    id: "argan",
    name: "Argan",
    story:
      "Long prized in body care tradition for its rich, warming texture, argan oil is naturally high in fatty acids and antioxidants that help nourish skin and support its moisture barrier. It's the foundation of our body cream — a generous formula built for daily use.",
    relatedProductSlugs: ["argan-body-whitening-cream"],
    image: "/images/ingredients/argan.jpg",
  },
  {
    id: "coffee",
    name: "Coffee",
    story:
      "Coffee's deep, earthy character has a history beyond the cup. Its natural grounds gently exfoliate while caffeine is known for supporting circulation and a brighter-looking complexion — gathered here into a weekly mask ritual, a short, grounding pause in a busy week.",
    relatedProductSlugs: ["coffee-detox-facemask"],
    image: "/images/ingredients/coffee.jpg",
  },
  {
    id: "jojoba",
    name: "Jojoba",
    story:
      "Known for its gentle character, jojoba oil closely resembles skin's own natural oils, making it easy to absorb and well suited to sensitive skin. That gentleness is formulated with a lighter touch for the smallest members of the family, in a soap designed for children's daily wash routines.",
    relatedProductSlugs: ["jojoba-kids-soap"],
    image: "/images/ingredients/jojoba.jpg",
  },
  {
    id: "shea",
    name: "Shea",
    story:
      "Reached for again and again, shea butter is rich in vitamins A and E and fatty acids known for helping lock in moisture and soothe dry, chapped skin. It's the quiet workhorse of body and lip care tradition — the foundation of a lip balm designed to travel everywhere with you.",
    relatedProductSlugs: ["shea-lip-balm"],
    image: "/images/ingredients/shea.jpg",
  },
  {
    id: "vitamin-c",
    name: "Vitamin C",
    story:
      "A familiar name in contemporary skincare, Vitamin C is a potent antioxidant known for supporting a brighter, more even-looking complexion and helping defend skin against everyday environmental stress. It's formulated here into a lightweight serum designed to sit at the start of a brightening morning routine.",
    relatedProductSlugs: ["vitamin-c-serum"],
    image: "/images/ingredients/vitamin-c.jpg",
  },
  {
    id: "solar-infusion",
    name: "Solar Infusion",
    story:
      "Some herbal formulations are prepared using a traditional solar-infusion process: jars set outdoors in sunlight through the day and brought back in each evening, repeated for around 40 days. The sun's gentle warmth slowly draws the herbs' natural compounds into the oil — a slow, hands-on part of how the collection is made.",
    relatedProductSlugs: [],
    image: "/images/ingredients/solar-infusion.jpg",
  },
];
