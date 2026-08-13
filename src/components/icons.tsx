/** Shared inline icon marks. Kept here so the same path data isn't pasted
 * into every call site — these each appear in 3+ places. */

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.47 1.29 4.93L2 22l5.31-1.39a9.87 9.87 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.9C21.96 6.45 17.5 2 12.04 2Zm5.79 14.05c-.24.68-1.4 1.3-1.93 1.36-.5.06-1.03.29-3.42-.72-2.88-1.22-4.73-4.16-4.87-4.35-.14-.19-1.16-1.55-1.16-2.96 0-1.4.73-2.09 1-2.38.24-.27.53-.34.71-.34s.36 0 .51.01c.17.01.39-.06.61.47.24.58.81 2 .88 2.14.07.14.11.31.02.5-.09.19-.14.31-.27.47-.14.17-.29.37-.41.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

export function HeartIcon({
  filled = false,
  className = "h-5 w-5",
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7.5-4.6-9.8-9.2C.7 8 2.2 4.8 5.4 4.1c2-.4 3.9.5 5.1 2.1a.6.6 0 0 0 1 0c1.2-1.6 3.1-2.5 5.1-2.1 3.2.7 4.7 3.9 3.2 7.2-2.3 4.6-9.8 9.2-9.8 9.2Z"
      />
    </svg>
  );
}
