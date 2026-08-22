"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Couldn't sign you up just now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="chapter-section bg-ivory py-[var(--space-section-lg)]">
      <div className="mx-auto grid max-w-standard gap-9 px-6 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
        <SectionHeading eyebrow="Stay Close" title="A Little Beauty, Delivered" size="large" />
        <div className="border-b border-gold/30 pb-2">
          <p className="max-w-xl text-balance text-sm leading-[1.8] text-walnut/65">
            New launches, skincare notes, ingredient stories and a little inspiration from Kashmir — sent occasionally to your inbox.
          </p>

          {submitted ? (
            <p className="mt-7 font-display text-2xl text-burgundy" role="status">
              Thank you — you&apos;re on the list.
            </p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mt-7 flex items-end gap-3">
                <div className="min-w-0 flex-1">
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Your email address"
                    className="w-full border-0 border-b border-walnut/30 bg-transparent px-0 py-3 text-sm text-ink outline-none transition-colors placeholder:text-walnut/38 focus:border-burgundy focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="editorial-link flex-shrink-0 pb-3 text-burgundy disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Joining…" : "Join"} <span aria-hidden="true">→</span>
                </button>
              </form>
              {error && <p className="mt-3 text-sm text-burgundy" role="alert">{error}</p>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
