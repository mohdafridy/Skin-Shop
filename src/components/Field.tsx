"use client";

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
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-1.5 block font-medium text-ink">
        {label}
        {required && <span className="text-burgundy"> *</span>}
      </span>
      <input
        id={id}
        name={name ?? id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-ink outline-none transition focus:border-burgundy ${
          error ? "border-burgundy" : "border-gold/30"
        }`}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="mt-1 block text-xs text-burgundy">
          {error}
        </span>
      )}
    </label>
  );
}
