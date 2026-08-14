"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="rounded-2xl border border-gold/20 bg-white/40 p-8 text-center font-display text-lg text-burgundy" role="status">
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
      <button
        type="submit"
        className="w-full rounded-full bg-burgundy px-7 py-3.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
      >
        Send Message
      </button>
    </form>
  );
}
