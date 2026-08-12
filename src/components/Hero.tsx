import Link from "next/link";
import SmartImage from "./SmartImage";

export default function Hero() {
  return (
    <section className="relative -mt-20 h-[92vh] min-h-[560px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <SmartImage
          src="/images/kashmir/hero-landscape.jpg"
          alt="The Skin Shop's full collection of botanical skincare arranged on a rock, set against the snow-capped mountains of Kashmir"
          label="The Skin Shop collection in Kashmir"
          priority
          labelPosition="corner"
          className="h-full w-full"
          imageClassName="animate-slow-zoom"
          sizes="100vw"
        />
      </div>
      {/* Guarantees header legibility regardless of the eventual photograph's tone */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/65 via-ink/20 to-ink/40" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 pt-20 text-center">
        <h1 className="max-w-3xl text-balance font-display text-4xl leading-[1.1] text-ivory sm:text-5xl lg:text-6xl">
          Kashmir, Bottled Beautifully.
        </h1>
        <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-ivory/85 sm:text-lg">
          Botanical beauty inspired by ritual, ingredient and a remarkable sense of
          place.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-full bg-ivory px-8 py-3.5 text-sm font-medium text-ink transition hover:bg-white"
          >
            Discover The Collection
          </Link>
          <Link
            href="/our-story"
            className="rounded-full border border-ivory/70 px-8 py-3.5 text-sm font-medium text-ivory transition hover:bg-ivory/10"
          >
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
