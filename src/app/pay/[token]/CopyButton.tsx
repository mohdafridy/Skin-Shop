"use client";

import { useState } from "react";

/** Copies a value (the UPI ID) to the clipboard with brief "Copied" feedback.
 * Falls back silently if the clipboard API is unavailable. */
export default function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context / permissions) — no-op; the value
      // is shown in full beside the button so it can still be copied by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex-shrink-0 rounded-full border border-ink px-4 py-1.5 text-xs font-medium text-ink transition hover:bg-ink hover:text-ivory"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
