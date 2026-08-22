export default function SectionDivider() {
  return (
    <div className="mx-auto flex max-w-6xl items-center gap-5 px-6 text-gold/65" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/25 to-gold/40" />
      <span className="kashmir-motif">
        <span />
        <span />
        <span />
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/25 to-gold/40" />
    </div>
  );
}
