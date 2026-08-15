"use client";

import { useEffect, useReducer } from "react";

export type Review = {
  id: string;
  rating: number;
  authorName: string;
  body: string;
  createdAt: string;
};

export type ReviewsResponse = {
  reviews: Review[];
  count: number;
  average: number | null;
};

/**
 * Module-scoped cache so the compact rating badge (ProductInfo) and the
 * full ReviewsSection — two independent components on the same page — share
 * one fetch instead of both hitting /api/reviews for the same product.
 */
const cache = new Map<string, ReviewsResponse>();
const inFlight = new Map<string, Promise<ReviewsResponse>>();
const listeners = new Map<string, Set<() => void>>();

function cacheKey(type: string, slug: string) {
  return `${type}:${slug}`;
}

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

async function load(type: "product" | "combo", slug: string): Promise<ReviewsResponse> {
  const key = cacheKey(type, slug);
  const existingFetch = inFlight.get(key);
  if (existingFetch) return existingFetch;

  const promise = fetch(`/api/reviews?type=${type}&slug=${encodeURIComponent(slug)}`)
    .then((res) => (res.ok ? (res.json() as Promise<ReviewsResponse>) : { reviews: [], count: 0, average: null }))
    .catch(() => ({ reviews: [], count: 0, average: null }) satisfies ReviewsResponse)
    .then((data) => {
      cache.set(key, data);
      inFlight.delete(key);
      notify(key);
      return data;
    });

  inFlight.set(key, promise);
  return promise;
}

/** Call after a successful submission so the next read reflects it (a new
 * submission is PENDING and won't change what's visible, but this keeps the
 * cache honest rather than silently stale). */
export function invalidateReviews(type: "product" | "combo", slug: string) {
  cache.delete(cacheKey(type, slug));
}

/** Forces a re-render when the cache updates, without mirroring the cache
 * into its own useState — the cache itself stays the single source of
 * truth, read fresh on every render, so there's nothing to keep in sync. */
export function useProductReviews(type: "product" | "combo", slug: string): ReviewsResponse | null {
  const key = cacheKey(type, slug);
  const [, forceRender] = useReducer((c: number) => c + 1, 0);

  useEffect(() => {
    let cancelled = false;

    if (!cache.has(key)) {
      load(type, slug).then(() => {
        if (!cancelled) forceRender();
      });
    }

    const listener = () => {
      if (!cancelled) forceRender();
    };
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);

    return () => {
      cancelled = true;
      listeners.get(key)?.delete(listener);
    };
  }, [key, type, slug]);

  return cache.get(key) ?? null;
}
