"use client";

import Image from "next/image";
import { useState } from "react";
import BotanicalMark from "./BotanicalMark";

type SmartImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  label?: string;
  className?: string;
  imageClassName?: string;
  /**
   * "center" (default) suits standalone image slots like cards. Use "corner"
   * for full-bleed backgrounds that carry their own overlaid foreground text
   * (e.g. a hero), so the placeholder caption doesn't collide with it.
   */
  labelPosition?: "center" | "corner";
};

/**
 * Renders the real, approved photograph at `src` when it exists.
 * Until brand assets are supplied, the file 404s and we fall back to a
 * quiet botanical placeholder instead of an inherited AI-generated image —
 * the moment a real file lands at this path, this component needs no changes.
 */
export default function SmartImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes,
  priority,
  fit = "cover",
  label,
  className = "",
  imageClassName = "",
  labelPosition = "center",
}: SmartImageProps) {
  const [errored, setErrored] = useState(false);
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {labelPosition === "center" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sand via-ivory to-sand px-6 text-center">
          <BotanicalMark className="h-8 w-8 text-gold" />
          <span className="max-w-[85%] font-display text-base text-walnut/70 text-balance">
            {label ?? alt}
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-sand via-ivory to-sand">
          <div className="absolute bottom-5 left-1/2 flex max-w-[90%] -translate-x-1/2 items-center gap-2 px-4 text-center">
            <BotanicalMark className="h-4 w-4 flex-shrink-0 text-gold" />
            <span className="text-balance font-display text-sm text-walnut/60">
              {label ?? alt}
            </span>
          </div>
        </div>
      )}
      {!errored &&
        (fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onError={() => setErrored(true)}
            className={`relative ${fitClass} ${imageClassName}`}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width ?? 800}
            height={height ?? 800}
            sizes={sizes}
            priority={priority}
            onError={() => setErrored(true)}
            className={`relative ${fitClass} ${imageClassName}`}
          />
        ))}
    </div>
  );
}
