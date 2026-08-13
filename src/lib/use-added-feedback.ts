"use client";

import { useState } from "react";

/** Brief "Added ✓" confirmation state after an add-to-cart action, then
 * back to normal — the customer can keep browsing without being forced
 * into the cart. Shared by every add-to-cart entry point on the site. */
export function useAddedFeedback(durationMs = 1800) {
  const [added, setAdded] = useState(false);
  function trigger() {
    setAdded(true);
    setTimeout(() => setAdded(false), durationMs);
  }
  return [added, trigger] as const;
}
