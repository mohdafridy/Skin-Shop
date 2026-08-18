import Link from "next/link";
import { ingredientStories } from "@/data/ingredients";
import SectionHeading from "./SectionHeading";
import IngredientCard from "./IngredientCard";
import IngredientScrollytelling from "./IngredientScrollytelling";
import Reveal from "./Reveal";

export default function IngredientStorytelling() {
  return (
    <section className="mx-auto max-w-standard px-6 py-[var(--space-section-lg)] sm:px-8">
      <SectionHeading
        eyebrow="Signature Ingredients"
        title="Ingredients With A Story"
        subtitle="Every ingredient earns its place. We look to botanicals with a history of care, pairing traditional beauty wisdom with thoughtful modern formulations."
        center
      />

      <div className="mt-12">
        <IngredientScrollytelling />
      </div>

      {/* Mobile/tablet: a sticky-scroll pairing doesn't translate below lg,
          so every ingredient gets its own stacked card instead — same
          image, name, story and product link, none of it dropped. */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
        {ingredientStories.map((ingredient, i) => (
          <Reveal key={ingredient.id} delay={(i % 4) * 60}>
            <IngredientCard ingredient={ingredient} />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-burgundy hover:underline"
        >
          Explore Our Ingredients
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
