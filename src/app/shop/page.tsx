import { Suspense } from "react";
import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Browse the full Skin Shop collection — cleansers, serums, creams, masks and more, rooted in Kashmir's botanical tradition.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopClient />
    </Suspense>
  );
}
