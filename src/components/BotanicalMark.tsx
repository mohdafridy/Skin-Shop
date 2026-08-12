type BotanicalMarkProps = {
  className?: string;
};

/**
 * A single restrained line-art sprig — the recurring botanical signature
 * used in dividers and in-place of missing photography. Deliberately spare:
 * one stem, a handful of leaves, nothing ornamental beyond that.
 */
export default function BotanicalMark({ className }: BotanicalMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M32 58V14" />
      <path d="M32 44c-6-2-10-7-10-14 5 0 9 3 10 8" />
      <path d="M32 34c6-2 10-7 10-14-5 0-9 3-10 8" />
      <path d="M32 24c-4-2-7-5-7-10 4 0 7 2 7 6" />
      <path d="M32 14c2-3 2-7 0-10-2 3-2 7 0 10" />
    </svg>
  );
}
