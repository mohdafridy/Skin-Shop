"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="bg-sand/60 py-20">
      <div className="mx-auto max-w-2xl px-6 text-center sm:px-8">
        <SectionHeading
          eyebrow="Stay Close"
          title="A Little Beauty, Delivered"
          center
        />
        <p className="mx-auto mt-3 max-w-md text-balance text-walnut/75">
          New rituals, ingredient stories and Skin Shop favourites — sent thoughtfully.
        </p>

        {submitted ? (
          <p className="mt-8 font-display text-lg text-burgundy" role="status">
            Thank you — you&apos;re on the list.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Your email address"
              className="w-full flex-1 rounded-full border border-gold/30 bg-ivory px-5 py-3 text-sm text-ink placeholder:text-walnut/40 focus:outline-none focus:ring-2 focus:ring-burgundy/50"
            />
            <button
              type="submit"
              className="flex-shrink-0 rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
            >
              Join The Ritual
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
