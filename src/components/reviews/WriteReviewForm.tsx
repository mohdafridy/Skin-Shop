"use client";

import { useState } from "react";
import { invalidateReviews } from "@/lib/reviews-client";
import { StarRatingInput } from "./RatingStars";

const fieldClass =
  "w-full rounded-xl border border-gold/30 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-150 ease-premium focus:border-burgundy";

export default function WriteReviewForm({
  type,
  slug,
  subjectName,
  onDone,
}: {
  type: "product" | "combo";
  slug: string;
  subjectName: string;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug, rating, authorName, authorEmail, body }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFeedback({ error: json.error ?? "Couldn't submit your review. Please try again." });
        return;
      }
      invalidateReviews(type, slug);
      setFeedback({ success: json.message });
      setTimeout(onDone, 1400);
    } catch {
      setFeedback({ error: "Couldn't submit your review. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (feedback?.success) {
    return (
      <div className="rounded-2xl border border-gold/20 bg-white/40 p-6 text-center">
        <p className="text-sm font-medium text-ink">Thank you for sharing your experience.</p>
        <p className="mt-1.5 text-sm text-walnut/70">{feedback.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gold/20 bg-white/40 p-6">
      <p className="text-xs uppercase tracking-wide text-walnut/60">
        Reviewing: <span className="text-ink">{subjectName}</span>
      </p>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Your rating</p>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="review-name">
            Your name
          </label>
          <input
            id="review-name"
            required
            maxLength={120}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="review-email">
            Email (optional, not shown publicly)
          </label>
          <input
            id="review-email"
            type="email"
            maxLength={254}
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="review-body">
          Your review
        </label>
        <textarea
          id="review-body"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`What did you think of ${subjectName}?`}
          className={fieldClass}
        />
      </div>

      <p className="text-xs text-walnut/60">
        Reviews are checked before they appear on the site, so yours won&apos;t show up right away.
      </p>

      {feedback?.error && (
        <p role="status" className="rounded-xl bg-burgundy/10 px-4 py-2.5 text-sm text-burgundy">
          {feedback.error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-burgundy px-6 py-2.5 text-sm font-medium text-ivory transition-[background-color,transform] duration-150 ease-premium hover:bg-burgundy-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
