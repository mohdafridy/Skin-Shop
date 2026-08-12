import type { RitualTag } from "./products";

export type RitualCategory = {
  tag: RitualTag;
  name: string;
  description: string;
  representativeSlug: string;
};

export const ritualCategories: RitualCategory[] = [
  {
    tag: "Cleanse",
    name: "Cleanse",
    description: "The first step — rose and moringa soap cleansers for a daily reset.",
    representativeSlug: "husn-e-yusuf-whitening-soap-cleanser",
  },
  {
    tag: "Treat",
    name: "Treat",
    description: "Serums, masks and gels for the moments you slow down and focus.",
    representativeSlug: "vitamin-c-serum",
  },
  {
    tag: "Hydrate",
    name: "Hydrate",
    description: "Creams and mists that carry moisture through the day and night.",
    representativeSlug: "dahab-whitening-night-cream",
  },
  {
    tag: "Exfoliate",
    name: "Exfoliate",
    description: "A gentler, weekly step for softness beneath the surface.",
    representativeSlug: "husn-e-yusuf-exfoliator",
  },
  {
    tag: "Hair",
    name: "Hair",
    description: "Rosemary, brought into a modern scalp-to-length ritual.",
    representativeSlug: "rosemary-hair-serum",
  },
  {
    tag: "Body",
    name: "Body",
    description: "Argan-rich care for the whole body, beyond the face.",
    representativeSlug: "argan-body-whitening-cream",
  },
  {
    tag: "Family Care",
    name: "Family Care",
    description: "Gentle formulas for the youngest members of the family.",
    representativeSlug: "jojoba-kids-soap",
  },
];
