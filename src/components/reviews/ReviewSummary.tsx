"use client";

import { StarRow } from "./RatingStars";
import type { Review } from "@/lib/reviews-client";

export default function ReviewSummary({ reviews, average }: { reviews: Review[]; average: number }) {
  const count = reviews.length;

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
      <div className="flex flex-shrink-0 flex-col items-start gap-1.5 sm:items-center">
        <span className="font-display text-4xl text-ink">{average.toFixed(1)}</span>
        <StarRow rating={average} size="h-4 w-4" />
        <span className="text-xs text-walnut/60">
          Based on {count} review{count === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const starCount = reviews.filter((r) => r.rating === star).length;
          const percentage = count > 0 ? (starCount / count) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3 text-xs text-walnut/70">
              <span className="w-10 flex-shrink-0">{star} star</span>
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand"
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${star} star: ${starCount} review${starCount === 1 ? "" : "s"}`}
              >
                <div
                  className="h-full rounded-full bg-gold transition-[width] duration-500 ease-premium motion-reduce:transition-none"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-6 flex-shrink-0 text-right">{starCount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
