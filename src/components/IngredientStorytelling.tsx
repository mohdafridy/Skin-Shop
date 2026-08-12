import { ingredientStories } from "@/data/ingredients";
import SectionHeading from "./SectionHeading";
import IngredientCard from "./IngredientCard";
import Reveal from "./Reveal";

export default function IngredientStorytelling() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Botanical Roots"
        title="Ingredients With A Story"
        subtitle="The names behind the collection — familiar botanicals, carried into contemporary format."
        center
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {ingredientStories.map((ingredient, i) => (
          <Reveal key={ingredient.id} delay={(i % 5) * 60}>
            <IngredientCard ingredient={ingredient} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
