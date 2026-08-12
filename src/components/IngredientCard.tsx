import type { IngredientStory } from "@/data/ingredients";
import BotanicalMark from "./BotanicalMark";

export default function IngredientCard({ ingredient }: { ingredient: IngredientStory }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gold/20 bg-white/40 p-6">
      <BotanicalMark className="h-6 w-6 text-gold" />
      <h3 className="mt-4 font-display text-xl text-ink">{ingredient.name}</h3>
      <p className="mt-2 flex-1 text-balance text-sm leading-relaxed text-walnut/75">
        {ingredient.story}
      </p>
    </div>
  );
}
