"use client";

import { useState } from "react";
import Image from "next/image";

type LogoProps = {
  light?: boolean;
  variant?: "mark" | "wordmark";
};

/**
 * The official supplied badge remains untouched and is still used wherever
 * the full brand mark is appropriate. In the storefront header we use a
 * typographic wordmark so the identity remains legible at navigation scale
 * instead of shrinking the detailed circular badge into visual noise.
 */
export default function Logo({ light = false, variant = "mark" }: LogoProps) {
  const [errored, setErrored] = useState(false);
  const src = light ? "/images/brand/logo-dark.png" : "/images/brand/logo.png";

  if (variant === "wordmark") {
    return (
      <span className="inline-flex items-baseline gap-2 whitespace-nowrap" aria-label="The Skin Shop">
        <span className="font-display text-[1.75rem] leading-none tracking-[-0.035em] sm:text-[2rem]">
          The Skin Shop
        </span>
        <span aria-hidden="true" className="hidden h-px w-5 bg-gold/80 sm:block" />
      </span>
    );
  }

  if (errored) {
    return (
      <span className="font-display text-2xl tracking-tight sm:text-[1.7rem]">
        The Skin Shop
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt="The Skin Shop"
      width={64}
      height={64}
      onError={() => setErrored(true)}
      className="h-12 w-12 sm:h-14 sm:w-14"
      priority
    />
  );
}
