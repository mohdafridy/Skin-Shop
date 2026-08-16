"use client";

import { useMemo, useState } from "react";
import { useProductReviews, type Review } from "@/lib/reviews-client";
import ReviewCard from "./reviews/ReviewCard";
import ReviewSummary from "./reviews/ReviewSummary";
import WriteReviewForm from "./reviews/WriteReviewForm";

type SortOption = "recent" | "highest" | "lowest";
type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5;

const PAGE_SIZE = 5;

function sortReviews(reviews: Review[], sort: SortOption): Review[] {
  const sorted = [...reviews];
  if (sort === "highest") sorted.sort((a, b) => b.rating - a.rating);
  else if (sort === "lowest") sorted.sort((a, b) => a.rating - b.rating);
  else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return sorted;
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
  const data = useProductReviews(type, slug);
  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState<SortOption>("recent");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredSorted = useMemo(() => {
    const reviews = data?.reviews ?? [];
    const filtered = ratingFilter === "all" ? reviews : reviews.filter((r) => r.rating === ratingFilter);
    return sortReviews(filtered, sort);
  }, [data, ratingFilter, sort]);

  const visible = filteredSorted.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSorted.length;

  function handleFilterChange(next: RatingFilter) {
    setRatingFilter(next);
    setVisibleCount(PAGE_SIZE);
  }

  function handleSortChange(next: SortOption) {
    setSort(next);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section id={`reviews-${slug}`} aria-labelledby={`reviews-heading-${slug}`} className="scroll-mt-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id={`reviews-heading-${slug}`} className="font-display text-2xl text-ink">
          Reviews {data && data.count > 0 ? `(${data.count})` : ""}
        </h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium text-ink transition-[background-color,color] duration-150 ease-premium hover:bg-ink hover:text-ivory active:scale-[0.98] motion-reduce:active:scale-100"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-premium motion-reduce:transition-none"
        style={{ gridTemplateRows: showForm ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-6">
            {showForm && (
              <WriteReviewForm type={type} slug={slug} subjectName={subjectName} onDone={() => setShowForm(false)} />
            )}
          </div>
        </div>
      </div>

      {!data ? (
        <div className="mt-8 animate-pulse space-y-3" aria-hidden="true">
          <div className="h-4 w-40 rounded bg-sand" />
          <div className="h-4 w-64 rounded bg-sand" />
        </div>
      ) : data.count === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-gold/30 bg-white/30 px-6 py-10 text-center">
          <p className="text-sm font-medium text-ink">No reviews yet</p>
          <p className="mt-1.5 text-sm text-walnut/70">
            Be the first to share your experience with {subjectName}.
          </p>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-full bg-burgundy px-6 py-2.5 text-sm font-medium text-ivory transition-[background-color,transform] duration-150 ease-premium hover:bg-burgundy-dark active:scale-[0.98] motion-reduce:active:scale-100"
            >
              Write the first review
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-8">
            <ReviewSummary reviews={data.reviews} average={data.average ?? 0} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gold/15 pt-5">
            <label className="flex items-center gap-2 text-xs text-walnut/70">
              Rating
              <select
                value={ratingFilter}
                onChange={(e) => handleFilterChange(e.target.value === "all" ? "all" : (Number(e.target.value) as RatingFilter))}
                className="rounded-lg border border-gold/30 bg-white px-2.5 py-1.5 text-xs text-ink outline-none transition-colors duration-150 ease-premium focus:border-burgundy"
              >
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-xs text-walnut/70">
              Sort by
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="rounded-lg border border-gold/30 bg-white px-2.5 py-1.5 text-xs text-ink outline-none transition-colors duration-150 ease-premium focus:border-burgundy"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </label>
          </div>

          {visible.length === 0 ? (
            <p className="mt-8 text-sm text-walnut/70">No reviews match this filter.</p>
          ) : (
            <ul className="mt-2">
              {visible.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </ul>
          )}

          {hasMore && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-full border border-gold/30 px-6 py-2.5 text-sm font-medium text-walnut/80 transition-colors duration-150 ease-premium hover:border-burgundy hover:text-burgundy"
              >
                Load More Reviews
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
