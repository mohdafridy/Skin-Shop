import Link from "next/link";
import { ingredientStories } from "@/data/ingredients";
import SectionHeading from "./SectionHeading";
import IngredientCard from "./IngredientCard";
import IngredientScrollytelling from "./IngredientScrollytelling";
import Reveal from "./Reveal";

export default function IngredientStorytelling() {
  return (
    <section className="chapter-section mx-auto max-w-standard px-6 py-[var(--space-section-lg)] sm:px-8">
      <div className="grid gap-7 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <SectionHeading
          eyebrow="Signature Ingredients"
          title="Ingredients With A Story"
          subtitle="Every ingredient earns its place. We look to botanicals with a history of care, pairing traditional beauty wisdom with thoughtful modern formulations."
          size="large"
        />
        <p className="max-w-sm justify-self-end text-sm leading-[1.8] text-walnut/55 lg:text-right">
          Scroll slowly on desktop to move through the ingredient study; the photography changes with each story.
        </p>
      </div>

      <div className="mt-14">
        <IngredientScrollytelling />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:hidden">
        {ingredientStories.map((ingredient, i) => (
          <Reveal key={ingredient.id} delay={(i % 4) * 60}>
            <IngredientCard ingredient={ingredient} />
          </Reveal>
        ))}
      </div>

      <div className="mt-12 lg:mt-8">
        <Link href="/shop" className="editorial-link text-burgundy">
          Explore Our Ingredients <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
