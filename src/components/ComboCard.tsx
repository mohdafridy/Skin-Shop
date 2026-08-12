import Link from "next/link";
import type { Combo } from "@/data/combos";
import SmartImage from "./SmartImage";

export default function ComboCard({ combo }: { combo: Combo }) {
  return (
    <Link
      href={`/rituals#${combo.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-white/40 transition hover:-translate-y-1"
    >
      <SmartImage
        src={combo.image}
        alt={`${combo.name} — ${combo.mood}`}
        label={combo.name}
        className="aspect-[4/5]"
        sizes="(min-width: 1024px) 30vw, 90vw"
        imageClassName="transition duration-700 ease-out group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-balance font-display text-xl text-ink">{combo.name}</h3>
        <p className="mt-2 text-balance text-sm leading-relaxed text-walnut/75">
          {combo.tagline}
        </p>
        <span className="mt-4 text-xs font-medium uppercase tracking-wide text-burgundy">
          Explore The Ritual →
        </span>
      </div>
    </Link>
  );
}
