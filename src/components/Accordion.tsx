export default function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-gold/20 py-5" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-open:rotate-45"
          aria-hidden="true"
        >
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      </summary>
      <div className="mt-3 text-balance text-sm leading-relaxed text-walnut/80">{children}</div>
    </details>
  );
}
