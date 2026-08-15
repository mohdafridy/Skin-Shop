"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "./icons";

type Review = {
  id: string;
  rating: number;
  authorName: string;
  body: string;
  createdAt: string;
};

type ReviewsResponse = {
  reviews: Review[];
  count: number;
  average: number | null;
};

function StarRow({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5 text-gold" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= Math.round(rating)} className={size} />
      ))}
    </div>
  );
}

export default function ReviewsSection({
  type,
  slug,
  subjectName,
}: {
  type: "product" | "combo";
  slug: string;
  subjectName: string;
}) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reviews?type=${type}&slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ReviewsResponse | null) => {
        if (!cancelled && json) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [type, slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      setFeedback({ success: json.message });
      setAuthorName("");
      setAuthorEmail("");
      setBody("");
      setRating(5);
      setShowForm(false);
    } catch {
      setFeedback({ error: "Couldn't submit your review. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Reviews</h2>
          {data && data.count > 0 && data.average !== null ? (
            <div className="mt-2 flex items-center gap-2.5">
              <StarRow rating={data.average} />
              <span className="text-sm text-walnut/70">
                {data.average.toFixed(1)} · {data.count} review{data.count === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            data && <p className="mt-2 text-sm text-walnut/70">No reviews yet.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-ivory"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-gold/20 bg-white/40 p-6"
        >
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">Your rating</p>
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  className="p-0.5 text-gold"
                >
                  <StarIcon filled={n <= (hoverRating || rating)} className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="review-name">
                Name
              </label>
              <input
                id="review-name"
                required
                maxLength={120}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-xl border border-gold/30 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-burgundy"
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
                className="w-full rounded-xl border border-gold/30 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-burgundy"
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
              className="w-full rounded-xl border border-gold/30 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-burgundy"
            />
          </div>

          <p className="text-xs text-walnut/60">
            Reviews are checked before they appear on the site, so yours won&apos;t show up right away.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-burgundy px-6 py-2.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      )}

      {feedback && (
        <p
          role="status"
          className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${
            feedback.error ? "bg-burgundy/10 text-burgundy" : "bg-olive/10 text-olive"
          }`}
        >
          {feedback.error ?? feedback.success}
        </p>
      )}

      {data && data.reviews.length > 0 && (
        <ul className="mt-8 space-y-6">
          {data.reviews.map((review) => (
            <li key={review.id} className="border-b border-gold/15 pb-6 last:border-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <StarRow rating={review.rating} />
                  <span className="text-sm font-medium text-ink">{review.authorName}</span>
                </div>
                <span className="text-xs text-walnut/50">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-2 text-balance text-sm leading-relaxed text-walnut/80">{review.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
