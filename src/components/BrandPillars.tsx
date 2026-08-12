import { brandPillars } from "@/data/navigation";

export default function BrandPillars() {
  return (
    <div className="border-b border-gold/15 bg-sand/40 py-4">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-6 text-center text-xs font-medium uppercase tracking-wide text-walnut/70 sm:px-8">
        {brandPillars.map((pillar, i) => (
          <li key={pillar} className="flex items-center gap-3">
            {i > 0 && <span className="text-gold" aria-hidden="true">·</span>}
            {pillar}
          </li>
        ))}
      </ul>
    </div>
  );
}
