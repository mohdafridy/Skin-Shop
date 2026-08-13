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
    name: "A Fresh Start",
    description: "The first step — rose and moringa soap cleansers for a daily reset.",
    representativeSlug: "husn-e-yusuf-whitening-soap-cleanser",
  },
  {
    tag: "Treat",
    name: "A Little Glow",
    description: "Serums, masks and gels for the moments you slow down and focus.",
    representativeSlug: "vitamin-c-serum",
  },
  {
    tag: "Hydrate",
    name: "A Slow Evening",
    description: "Creams and mists that carry moisture through the day and night.",
    representativeSlug: "dahab-whitening-night-cream",
  },
  {
    tag: "Exfoliate",
    name: "A Weekly Reset",
    description: "A gentler, weekly step for softness beneath the surface.",
    representativeSlug: "husn-e-yusuf-exfoliator",
  },
  {
    tag: "Hair",
    name: "Beyond The Face",
    description: "Rosemary, brought into a modern scalp-to-length ritual.",
    representativeSlug: "rosemary-hair-serum",
  },
  {
    tag: "Body",
    name: "Whole-Body Care",
    description: "Argan-rich care for the whole body, beyond the face.",
    representativeSlug: "argan-body-whitening-cream",
  },
  {
    tag: "Family Care",
    name: "Everyday Essentials",
    description: "Gentle formulas for the youngest members of the family.",
    representativeSlug: "jojoba-kids-soap",
  },
];
