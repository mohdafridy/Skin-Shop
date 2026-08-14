"use client";

import Link from "next/link";
import SmartImage from "./SmartImage";
import { productTagline } from "@/data/navigation";
import { track } from "@/lib/analytics";

/** One minimal carved-corner flourish, reused (mirrored) in all four corners. */
function CornerFlourish({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M3 15V6a3 3 0 0 1 3-3h9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M3 21q7 0 7 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative -mt-20 h-[92vh] min-h-[560px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <SmartImage
          src="/images/kashmir/hero-landscape.jpg"
          alt="A selection of The Skin Shop's botanical skincare arranged on a rock, set against the snow-capped mountains of Kashmir"
          label="The Skin Shop collection in Kashmir"
          priority
          labelPosition="corner"
          className="h-full w-full"
          imageClassName="animate-slow-zoom"
          sizes="100vw"
        />
      </div>

      {/* Slim, always-on gradient — keeps the transparent nav legible without tinting the photograph */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/40 to-transparent" />

      {/* Localized panel behind the text only, so we never darken the whole image */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_58%_at_50%_50%,rgba(32,29,26,0.5),transparent_72%)] lg:bg-[radial-gradient(ellipse_50%_62%_at_27%_48%,rgba(32,29,26,0.5),transparent_72%)]" />

      {/* Decorative Kashmiri-inspired frame — CSS/SVG only, purely ornamental */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Carved double-line border */}
        <div className="absolute inset-3 border border-ivory/40 sm:inset-4 lg:inset-6" />
        <div className="absolute inset-[14px] border border-ivory/20 sm:inset-[18px] lg:inset-[26px]" />

        {/* Corner flourishes */}
        <CornerFlourish className="absolute left-3 top-3 h-8 w-8 text-ivory/55 sm:left-4 sm:top-4 sm:h-10 sm:w-10 lg:left-5 lg:top-5 lg:h-12 lg:w-12" />
        <CornerFlourish className="absolute right-3 top-3 h-8 w-8 -scale-x-100 text-ivory/55 sm:right-4 sm:top-4 sm:h-10 sm:w-10 lg:right-5 lg:top-5 lg:h-12 lg:w-12" />
        <CornerFlourish className="absolute bottom-3 left-3 h-8 w-8 -scale-y-100 text-ivory/55 sm:bottom-4 sm:left-4 sm:h-10 sm:w-10 lg:bottom-5 lg:left-5 lg:h-12 lg:w-12" />
        <CornerFlourish className="absolute bottom-3 right-3 h-8 w-8 -scale-100 text-ivory/55 sm:bottom-4 sm:right-4 sm:h-10 sm:w-10 lg:bottom-5 lg:right-5 lg:h-12 lg:w-12" />

        {/* Scalloped trim along the bottom edge */}
        <svg
          className="absolute inset-x-0 bottom-0 h-3 w-full text-ivory/45 sm:h-4"
          viewBox="0 0 200 14"
          preserveAspectRatio="none"
        >
          <pattern id="kashmiriScallop" width="20" height="14" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="14" r="7" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#kashmiriScallop)" />
        </svg>
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-6 pt-20 text-center sm:px-8 lg:items-start lg:justify-start lg:px-8 lg:pt-32 lg:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{productTagline}</p>

        <h1 className="mt-4 max-w-2xl text-balance font-display text-4xl font-medium leading-[1.15] tracking-tight text-ivory sm:text-5xl lg:max-w-3xl lg:text-7xl">
          Rooted in Kashmir.<br className="hidden lg:block" /> Made for Your Ritual.
        </h1>

        <p className="mt-5 max-w-sm text-balance text-base leading-relaxed text-ivory/90 sm:text-lg">
          Botanical beauty inspired by ritual, ingredients, and a remarkable sense of
          place.
        </p>

        <div className="mt-9 flex flex-col items-center gap-5 sm:flex-row">
          <Link
            href="/shop"
            onClick={() => track({ name: "hero_cta_click", cta: "Shop All" })}
            className="rounded-full bg-ivory px-8 py-3.5 text-sm font-medium text-ink transition hover:bg-sand"
          >
            Shop All
          </Link>
          <Link
            href="/our-story"
            onClick={() => track({ name: "hero_cta_click", cta: "Our Story" })}
            className="group flex items-center gap-1.5 text-sm font-medium text-ivory transition hover:text-ivory/80"
          >
            Our Story
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 hidden flex-col items-center gap-2 lg:flex">
        <span className="font-sans text-xs font-medium tracking-wide text-ivory/70">
          Scroll to explore
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-4 w-4 text-ivory/55"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v13m0 0-4-4m4 4 4-4" />
        </svg>
      </div>
    </section>
  );
}
