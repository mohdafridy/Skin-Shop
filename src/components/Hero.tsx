import Link from "next/link";
import SmartImage from "./SmartImage";

export default function Hero() {
  return (
    <section className="group relative -mt-20 h-[92vh] min-h-[560px] w-full overflow-hidden">
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_58%_at_50%_50%,rgba(32,29,26,0.5),transparent_72%)] opacity-100 transition-opacity duration-500 ease-out lg:bg-[radial-gradient(ellipse_50%_62%_at_27%_48%,rgba(32,29,26,0.55),transparent_72%)] lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100" />

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-6 pt-20 text-center sm:px-8 lg:items-start lg:justify-start lg:px-8 lg:pt-32 lg:text-left lg:transition-transform lg:duration-500 lg:ease-out lg:group-hover:-translate-y-2 lg:group-focus-within:-translate-y-2">
        <h1 className="max-w-2xl text-balance font-display text-4xl font-medium leading-[1.15] tracking-tight text-ivory transition-opacity duration-500 ease-out sm:text-5xl lg:max-w-3xl lg:text-7xl lg:opacity-[0.18] lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          Kashmir,<br className="hidden lg:block" /> Bottled Beautifully.
        </h1>

        <div className="hidden h-px w-16 bg-gold/60 opacity-0 transition-opacity duration-500 ease-out lg:mt-7 lg:block lg:group-hover:opacity-100 lg:group-focus-within:opacity-100" />

        <p className="mt-5 max-w-sm text-balance text-base leading-relaxed text-ivory/90 transition-opacity duration-500 ease-out sm:text-lg lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 max-lg:opacity-0 max-lg:[animation:fade-up_0.7s_ease-out_0.15s_both]">
          Botanical beauty inspired by ritual, ingredients, and a remarkable sense of
          place.
        </p>

        <div className="mt-9 flex flex-col gap-4 transition-opacity duration-500 ease-out sm:flex-row lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 max-lg:opacity-0 max-lg:[animation:fade-up_0.7s_ease-out_0.3s_both]">
          <Link
            href="/shop"
            className="rounded-full bg-ivory px-8 py-3.5 text-sm font-medium text-ink transition hover:bg-sand"
          >
            Discover the Collection
          </Link>
          <Link
            href="/our-story"
            className="rounded-full border border-ivory/35 bg-ivory/5 px-8 py-3.5 text-sm font-medium text-ivory backdrop-blur-sm transition hover:border-ivory/60 hover:bg-ivory/15"
          >
            Our Story
          </Link>
        </div>
      </div>

      {/* Optional cue — desktop-only, stays present alongside the revealed content */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 hidden flex-col items-center gap-2 lg:flex">
        <span className="font-sans text-xs font-medium tracking-wide text-ivory/70">
          Explore
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
