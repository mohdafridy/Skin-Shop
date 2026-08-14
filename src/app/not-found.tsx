import Link from "next/link";
import type { Metadata } from "next";
import BotanicalMark from "@/components/BotanicalMark";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: noIndex,
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center sm:px-8">
      <BotanicalMark className="h-10 w-10 text-gold" />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">404</p>
      <h1 className="mt-3 text-balance font-display text-3xl leading-tight text-ink sm:text-4xl">
        This page has wandered off the path.
      </h1>
      <p className="mt-4 text-balance leading-relaxed text-walnut/75">
        The page you&apos;re looking for doesn&apos;t exist, or may have moved. Let&apos;s get you
        back to the collection.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/shop"
          className="rounded-full bg-burgundy px-8 py-3.5 text-sm font-medium text-ivory transition-[background-color,transform] duration-[200ms] ease-premium hover:bg-burgundy-dark active:scale-[0.98]"
        >
          Shop All
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-walnut/70 underline-offset-2 transition-colors duration-[180ms] ease-premium hover:text-burgundy hover:underline"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
