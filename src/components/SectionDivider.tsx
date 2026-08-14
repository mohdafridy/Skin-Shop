import BotanicalMark from "./BotanicalMark";

export default function SectionDivider() {
  return (
    <div className="mx-auto flex max-w-6xl items-center gap-4 px-6" aria-hidden="true">
      <span className="h-px flex-1 bg-gold/20" />
      <BotanicalMark className="h-5 w-5 text-gold/70" />
      <span className="h-px flex-1 bg-gold/20" />
    </div>
  );
}
