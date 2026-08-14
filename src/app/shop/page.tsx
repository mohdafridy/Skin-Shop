import { Suspense } from "react";
import type { Metadata } from "next";
import ShopClient from "./ShopClient";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Browse the full Skin Shop collection — cleansers, serums, creams, masks and more, rooted in Kashmir's botanical tradition.",
  // Collection/category/ritual/search filters are query params on this one
  // page (no separate routes), so every variant canonicalizes here to avoid
  // indexing near-duplicate filtered URLs.
  alternates: canonical("/shop"),
};

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopClient />
    </Suspense>
  );
}
