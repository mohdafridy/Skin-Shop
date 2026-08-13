import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The products you've saved for later at The Skin Shop.",
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
        Saved For Later
      </p>
      <h1 className="font-display text-4xl leading-tight text-ink">Your Wishlist</h1>
      <p className="mt-3 max-w-md text-balance leading-relaxed text-walnut/75">
        Kept on this device — no account needed.
      </p>

      <div className="mt-12">
        <WishlistClient />
      </div>
    </div>
  );
}
