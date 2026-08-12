export type Testimonial = {
  quote: string;
  author: string;
  location?: string;
};

/**
 * Ready for verified customer reviews once collected. Not populated with
 * placeholder quotes — the brief is explicit that reviews must not be
 * invented, so the Customer Experience section renders the supplied
 * statement and disclaimer instead of cards from this component for now.
 */
export default function TestimonialCard({ quote, author, location }: Testimonial) {
  return (
    <figure className="flex h-full flex-col justify-between rounded-2xl border border-gold/20 bg-white/50 p-6">
      <blockquote className="text-balance font-display text-lg leading-snug text-ink">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-4 text-sm text-walnut/70">
        {author}
        {location ? `, ${location}` : ""}
      </figcaption>
    </figure>
  );
}
