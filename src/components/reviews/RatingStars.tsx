"use client";

import { useState } from "react";
import { StarIcon } from "@/components/icons";

export function StarRow({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5 text-gold" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= Math.round(rating)} className={size} />
      ))}
    </div>
  );
}

/**
 * A single focusable "slider" rather than a radiogroup of five buttons —
 * a radiogroup needs its own focus to move between options on arrow keys
 * (roving tabindex), which is more machinery than a 1-5 value needs and
 * risks the visual getting stuck on whichever star last had focus while
 * arrow keys silently change a different underlying value. One tab stop
 * with aria-valuenow/aria-valuetext avoids that entirely; the five stars
 * underneath exist only as large, precise mouse/touch click targets.
 */
export function StarRatingInput({
  value,
  onChange,
  size = "h-6 w-6",
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: string;
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, value + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, value - 1));
    }
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Your rating"
      aria-valuemin={1}
      aria-valuemax={5}
      aria-valuenow={value}
      aria-valuetext={`${value} out of 5 stars`}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHoverValue(0)}
      className="flex w-fit items-center gap-1 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHoverValue(n)}
          className="rounded-sm p-2 text-gold transition-transform duration-150 ease-premium hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <StarIcon filled={n <= displayValue} className={`${size} transition-colors duration-150 ease-premium`} />
        </button>
      ))}
    </div>
  );
}
