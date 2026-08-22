type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
  size?: "default" | "large";
};

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  light = false,
  size = "default",
}: SectionHeadingProps) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && (
        <div className={`mb-4 flex items-center gap-3 ${center ? "justify-center" : ""}`}>
          {!center && <span className={`h-px w-8 ${light ? "bg-gold/70" : "bg-gold/80"}`} aria-hidden="true" />}
          <p
            className={`text-[0.68rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.72rem] ${
              light ? "text-gold" : "text-burgundy"
            }`}
          >
            {eyebrow}
          </p>
        </div>
      )}
      <h2
        className={`text-balance font-display font-normal tracking-[-0.035em] ${
          size === "large"
            ? "text-[2.65rem] leading-[0.98] sm:text-5xl lg:text-[4rem]"
            : "text-[2.2rem] leading-[1.02] sm:text-[2.8rem] lg:text-[3.25rem]"
        } ${light ? "text-ivory" : "text-ink"}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-balance text-[0.95rem] leading-[1.75] sm:text-base ${
            center ? "mx-auto max-w-2xl" : "max-w-2xl"
          } ${light ? "text-ivory/70" : "text-walnut/72"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
