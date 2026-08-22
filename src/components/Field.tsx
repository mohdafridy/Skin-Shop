"use client";

import { useState } from "react";

/** Labelled text input with inline validation messaging. Shared by the
 * checkout form and the account sign-in/register forms. */
export default function Field({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  error,
  required = true,
  autoComplete,
  showToggle = false,
}: {
  label: string;
  id: string;
  /** Defaults to `id`. Only matters for forms read via FormData (a Server
   * Action, `<form action={...}>`) — the checkout/account forms read
   * `value` from state directly and never rely on it. */
  name?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  /** Opt-in reveal button for password fields — lets the user check what
   * they typed (e.g. a stray trailing space). Only has an effect when
   * `type` is "password". */
  showToggle?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const canToggle = showToggle && isPassword;
  const inputType = canToggle && revealed ? "text" : type;

  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-1.5 block font-medium text-ink">
        {label}
        {required && <span className="text-burgundy"> *</span>}
      </span>
      <div className="relative">
        <input
          id={id}
          name={name ?? id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white py-2.5 pl-4 text-ink outline-none transition focus:border-burgundy focus:ring-2 focus:ring-burgundy/50 ${
            canToggle ? "pr-16" : "pr-4"
          } ${error ? "border-burgundy" : "border-gold/30"}`}
        />
        {canToggle && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-medium uppercase tracking-wide text-walnut/70 transition hover:text-burgundy"
          >
            {revealed ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} role="alert" className="mt-1 block text-xs text-burgundy">
          {error}
        </span>
      )}
    </label>
  );
}
