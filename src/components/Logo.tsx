"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Renders the official logo file once it's placed at /public/images/brand/logo.svg
 * (light) or logo-dark.svg (dark, for use over transparent/hero contexts).
 * Until then, falls back to a plain text wordmark — never a redrawn or
 * reinterpreted mark.
 */
export default function Logo({ light = false }: { light?: boolean }) {
  const [errored, setErrored] = useState(false);
  const src = light ? "/images/brand/logo-dark.svg" : "/images/brand/logo.svg";

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
      width={180}
      height={48}
      onError={() => setErrored(true)}
      className="h-9 w-auto sm:h-10"
      priority
    />
  );
}
