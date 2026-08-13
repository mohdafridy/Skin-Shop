type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  light = false,
}: SectionHeadingProps) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && (
        <p
          className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${
            light ? "text-sand" : "text-burgundy"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-balance font-display text-3xl leading-tight sm:text-4xl lg:text-[2.75rem] ${
          light ? "text-ivory" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-balance text-base leading-relaxed ${
            center ? "mx-auto max-w-xl" : "max-w-xl"
          } ${light ? "text-ivory/75" : "text-walnut/75"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
