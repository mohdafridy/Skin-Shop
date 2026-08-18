"use client";

import Link from "next/link";
import SmartImage from "./SmartImage";
import BotanicalMark from "./BotanicalMark";
import { productTagline } from "@/data/navigation";
import { track } from "@/lib/analytics";

/**
 * "Option C" editorial hero — two reading zones inside one continuous
 * photograph: a quiet, gradient-darkened story area (LEFT on desktop, TOP on
 * mobile) and a bright product still-life (RIGHT / lower). The gradient is
 * localized — it fades out before the products — rather than a panel or a
 * whole-image tint, so the photo never looks overlaid.
 *
 * Art-directed sources are swapped per breakpoint: a portrait crop on phones,
 * a wide crop on desktop, so each viewport gets a composition made for it.
 */
export default function Hero() {
  return (
    <section className="relative -mt-[72px] h-[clamp(780px,120vw,900px)] w-full overflow-hidden lg:h-[clamp(720px,54vw,820px)]">
      {/* Photography. Mobile portrait / desktop wide — each viewport downloads
          only its own image. The hero image is the LCP element, so it is
          eagerly loaded (priority), never lazy. */}
      <div className="absolute inset-0">
        <SmartImage
          src="/images/kashmir/hero-mobile.png"
          alt="The Skin Shop's skincare collection arranged before the Dal Lake at sunset in Kashmir"
          label="The Skin Shop collection in Kashmir"
          priority
          labelPosition="corner"
          className="h-full w-full lg:hidden"
          imageClassName="animate-slow-zoom object-center"
          sizes="100vw"
        />
        <SmartImage
          src="/images/kashmir/hero-desktop.png"
          alt="The Skin Shop's full skincare collection arranged before the Dal Lake at sunset in Kashmir"
          label="The Skin Shop collection in Kashmir"
          priority
          labelPosition="corner"
          className="hidden h-full w-full lg:block"
          imageClassName="animate-slow-zoom object-center"
          sizes="100vw"
        />
      </div>

      {/* Localized text-zone gradient — warm wine/brown, no hard edge.
          Mobile: from the top, gone before the lower product cluster.
          Desktop: from the left, gone before the right-side products. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(55,22,25,0.58)_0%,rgba(55,22,25,0.38)_30%,rgba(55,22,25,0.12)_55%,rgba(55,22,25,0)_72%)] lg:bg-[linear-gradient(98deg,rgba(84,33,43,0.74)_0%,rgba(84,33,43,0.48)_25%,rgba(84,33,43,0.16)_44%,transparent_60%)]" />

      {/* Slim top gradient — keeps the transparent nav legible without tinting
          the whole photograph. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/35 to-transparent" />

      {/* Copy. Mobile: upper third, story-first; capped at 330px so it never
          runs across the products. Desktop: left ~8% inset, upper third. */}
      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col items-start justify-start px-6 pt-[115px] text-left sm:px-8 lg:px-8 lg:pt-[210px]">
        <p
          className="stagger-in text-xs font-semibold uppercase tracking-[0.2em] text-gold lg:text-sm lg:tracking-[0.22em]"
          style={{ "--stagger-rise": "6px", "--stagger-delay": "0ms" } as React.CSSProperties}
        >
          {productTagline}
        </p>

        <h1
          className="stagger-in mt-4 max-w-[330px] font-display font-normal tracking-tight text-ivory text-[clamp(2.625rem,10.6vw,3.25rem)] leading-[0.99] lg:mt-5 lg:max-w-[520px] lg:font-medium lg:text-[clamp(3.5rem,4.6vw,4.5rem)] lg:leading-[1.0]"
          style={{ "--stagger-rise": "10px", "--stagger-delay": "80ms" } as React.CSSProperties}
        >
          Rooted in Kashmir.
          <br />
          Made for Your Ritual.
        </h1>

        {/* Fine gold divider with a small botanical ornament — craftsmanship
            cue. Desktop/tablet only; on phones the vertical budget is spent on
            the headline and copy instead. */}
        <div
          className="stagger-in mt-7 hidden items-center gap-3 sm:flex"
          style={{ "--stagger-rise": "6px", "--stagger-delay": "140ms" } as React.CSSProperties}
          aria-hidden="true"
        >
          <span className="h-px w-24 bg-gradient-to-r from-transparent to-gold/60 lg:w-28" />
          <BotanicalMark className="h-4 w-4 flex-shrink-0 text-gold/85" />
          <span className="h-px w-24 bg-gradient-to-l from-transparent to-gold/60 lg:w-28" />
        </div>

        <p
          className="stagger-in mt-6 max-w-[315px] text-base leading-[1.5] text-ivory/90 sm:max-w-[360px] lg:text-[17px] lg:leading-[1.55]"
          style={{ "--stagger-rise": "8px", "--stagger-delay": "200ms" } as React.CSSProperties}
        >
          Botanical beauty inspired by ritual, ingredients, and a remarkable sense of
          place.
        </p>

        <div
          className="stagger-in mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 lg:mt-8"
          style={{ "--stagger-rise": "0px", "--stagger-delay": "260ms" } as React.CSSProperties}
        >
          <Link
            href="/shop"
            onClick={() => track({ name: "hero_cta_click", cta: "Shop All" })}
            className="group inline-flex h-[54px] min-w-[170px] items-center justify-between gap-5 rounded-full bg-ivory pl-7 pr-6 text-sm font-semibold uppercase tracking-[0.12em] text-burgundy-dark transition-[background-color,transform] duration-[180ms] ease-premium hover:-translate-y-px hover:bg-sand sm:min-w-[190px]"
          >
            Shop All
            <span
              aria-hidden="true"
              className="text-base transition-transform duration-[180ms] ease-premium group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
          <Link
            href="/our-story"
            onClick={() => track({ name: "hero_cta_click", cta: "Our Story" })}
            className="text-sm font-medium text-ivory underline decoration-gold/50 underline-offset-4 transition-colors duration-[180ms] ease-premium hover:decoration-ivory"
          >
            Our Story
          </Link>
        </div>
      </div>

      {/* Scroll cue — desktop only. */}
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
