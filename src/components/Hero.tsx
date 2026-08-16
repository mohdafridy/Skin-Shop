"use client";

import Link from "next/link";
import SmartImage from "./SmartImage";
import { productTagline } from "@/data/navigation";
import { track } from "@/lib/analytics";

export default function Hero() {
  return (
    <section className="relative -mt-[72px] h-[clamp(500px,42vw,640px)] w-full overflow-hidden">
      <div className="absolute inset-0">
        <SmartImage
          src="/images/kashmir/hero-landscape-new.png"
          alt="The Skin Shop's botanical skincare products displayed on a moss-covered rock against the Kashmir mountains"
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

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-6 pt-20 text-center sm:px-8 lg:items-start lg:justify-start lg:px-8 lg:pt-32 lg:text-left">
        <p
          className="stagger-in text-xs font-semibold uppercase tracking-[0.2em] text-gold"
          style={{ "--stagger-rise": "6px", "--stagger-delay": "0ms" } as React.CSSProperties}
        >
          {productTagline}
        </p>

        <h1
          className="stagger-in mt-4 max-w-2xl text-balance font-display text-4xl font-medium leading-[1.15] tracking-tight text-ivory sm:text-5xl lg:max-w-3xl lg:text-7xl"
          style={{ "--stagger-rise": "10px", "--stagger-delay": "80ms" } as React.CSSProperties}
        >
          Rooted in Kashmir.<br className="hidden lg:block" /> Made for Your Ritual.
        </h1>

        <p
          className="stagger-in mt-5 max-w-sm text-balance text-base leading-relaxed text-ivory/90 sm:text-lg"
          style={{ "--stagger-rise": "8px", "--stagger-delay": "160ms" } as React.CSSProperties}
        >
          Botanical beauty inspired by ritual, ingredients, and a remarkable sense of
          place.
        </p>

        <div
          className="stagger-in mt-9 flex flex-col items-center gap-5 sm:flex-row"
          style={{ "--stagger-rise": "0px", "--stagger-delay": "240ms" } as React.CSSProperties}
        >
          <Link
            href="/shop"
            onClick={() => track({ name: "hero_cta_click", cta: "Shop All" })}
            className="rounded-full bg-ivory px-8 py-3.5 text-sm font-medium text-ink transition-[background-color,transform] duration-[180ms] ease-premium hover:-translate-y-px hover:bg-sand"
          >
            Shop All
          </Link>
          <Link
            href="/our-story"
            onClick={() => track({ name: "hero_cta_click", cta: "Our Story" })}
            className="group flex items-center gap-1.5 text-sm font-medium text-ivory transition-colors duration-[180ms] ease-premium hover:text-ivory/80"
          >
            Our Story
            <span
              aria-hidden="true"
              className="transition-transform duration-[180ms] ease-premium group-hover:translate-x-1"
            >
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
