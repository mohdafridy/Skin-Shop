"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Couldn't send your message. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="rounded-md border border-gold/20 bg-white/40 p-8 text-center font-display text-lg text-burgundy" role="status">
        Thank you — we&apos;ve received your message and will be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-gold/30 bg-white/60 px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-burgundy/50"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-gold/30 bg-white/60 px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-burgundy/50"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-gold/30 bg-white/60 px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-burgundy/50"
        />
      </div>
      {error && (
        <p className="text-sm text-burgundy" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-burgundy px-7 py-3.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
