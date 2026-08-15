"use client";

import { useState } from "react";
import { formatRelativeDate } from "@/lib/format";
import type { Review } from "@/lib/reviews-client";
import { StarRow } from "./RatingStars";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// Long enough that most reviews never trigger the clamp — this is a safety
// valve for outliers, not a default reading experience.
const CLAMP_THRESHOLD = 320;

export default function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.length > CLAMP_THRESHOLD;

  return (
    <li className="border-b border-gold/15 py-6 first:pt-0 last:border-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sand text-xs font-medium text-walnut/80">
          {initials(review.authorName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="text-sm font-medium text-ink">{review.authorName}</span>
            <span className="text-xs text-walnut/50">{formatRelativeDate(review.createdAt)}</span>
          </div>
          <div className="mt-1.5">
            <StarRow rating={review.rating} size="h-3.5 w-3.5" />
          </div>
          <p
            className={`mt-2.5 text-balance text-sm leading-relaxed text-walnut/80 ${
              isLong && !expanded ? "line-clamp-4" : ""
            }`}
          >
            {review.body}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 text-xs font-medium text-burgundy underline-offset-2 transition-colors duration-150 ease-premium hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
