"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * The official logo — a self-contained circular badge (opaque white disc
 * behind black linework/text), so the same file works over both light and
 * dark/transparent backgrounds without a separate redraw. logo.svg/
 * logo-dark.svg are kept as separate paths in case a true dark-mode variant
 * is supplied later; both currently point at the same source file. Falls
 * back to a plain text wordmark only if a file ever goes missing — never a
 * redrawn or reinterpreted mark.
 */
export default function Logo({ light = false }: { light?: boolean }) {
  const [errored, setErrored] = useState(false);
  const src = light ? "/images/brand/logo-dark.png" : "/images/brand/logo.png";

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
