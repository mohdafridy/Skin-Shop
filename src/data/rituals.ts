export type RitualCategory = {
  /** Value(s) passed to /shop?ritual=... — joined with a comma when there's
   * more than one, so a single mood pathway can OR together a ritualTag
   * and/or collection value (e.g. Hair + Body) without inventing a new,
   * fake unified category that doesn't exist in the product data. */
  filterValues: string[];
  name: string;
  description: string;
  representativeSlug: string;
};

export const ritualCategories: RitualCategory[] = [
  {
    filterValues: ["Cleanse"],
    name: "A Fresh Start",
    description: "The first step — rose and moringa soap cleansers for a daily reset.",
    representativeSlug: "husn-e-yusuf-whitening-soap-cleanser",
  },
  {
    filterValues: ["Treat"],
    name: "A Little Glow",
    description: "Serums, masks and gels for the moments you slow down and focus.",
    representativeSlug: "vitamin-c-serum",
  },
  {
    filterValues: ["Hydrate"],
    name: "A Slow Evening",
    description: "Creams and mists that carry moisture through the day and night.",
    representativeSlug: "dahab-whitening-night-cream",
  },
  {
    filterValues: ["Exfoliate"],
    name: "A Weekly Reset",
    description: "A gentler, weekly step for softness beneath the surface.",
    representativeSlug: "husn-e-yusuf-exfoliator",
  },
  {
    filterValues: ["Hair", "Body"],
    name: "Care Beyond The Face",
    description: "Rosemary hair care and argan body care, for the rest of you.",
    representativeSlug: "rosemary-hair-serum",
  },
  {
    filterValues: ["Family Care", "Lip Care"],
    name: "Everyday Essentials",
    description: "Gentle lip and family formulas, reached for every day.",
    representativeSlug: "jojoba-kids-soap",
  },
];
