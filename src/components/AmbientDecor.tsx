"use client";

import { useEffect, useRef, useState } from "react";

type AmbientDecorProps = {
  variant: "story" | "rituals" | "builder" | "ingredients" | "newsletter";
};

/**
 * Decorative, non-interactive atmosphere for selected editorial chapters.
 * Everything here is aria-hidden and pointer-events-none: it can never block
 * shopping controls, links, form fields or checkout interactions.
 */
export default function AmbientDecor({ variant }: AmbientDecorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`ambient-decor ambient-decor--${variant} ${visible ? "is-visible" : ""}`}
      aria-hidden="true"
    >
      {variant === "story" && (
        <>
          <span className="ambient-word ambient-word--story">KASHMIR</span>
          <BotanicalStem className="ambient-botanical ambient-botanical--story" />
          <span className="ambient-edge-label ambient-edge-label--story">01 — ROOTED IN KASHMIR</span>
        </>
      )}

      {variant === "rituals" && (
        <>
          <BotanicalSeal className="ambient-seal ambient-seal--rituals" />
          <CornerMotif className="ambient-corner ambient-corner--rituals" />
          <span className="ambient-edge-label ambient-edge-label--rituals">02 — THE RITUAL</span>
        </>
      )}

      {variant === "builder" && (
        <>
          <span className="ambient-word ambient-word--builder">RITUAL</span>
          <SaffronThreads className="ambient-threads ambient-threads--builder" />
          <span className="ambient-gold-dot ambient-gold-dot--one" />
          <span className="ambient-gold-dot ambient-gold-dot--two" />
          <span className="ambient-gold-dot ambient-gold-dot--three" />
        </>
      )}

      {variant === "ingredients" && (
        <>
          <span className="ambient-word ambient-word--ingredients">BOTANICALS</span>
          <BotanicalStem className="ambient-botanical ambient-botanical--ingredients" />
          <SaffronThreads className="ambient-threads ambient-threads--ingredients" />
          <span className="ambient-edge-label ambient-edge-label--ingredients">03 — INGREDIENT STUDY</span>
        </>
      )}

      {variant === "newsletter" && (
        <>
          <LeafShadow className="ambient-leaf-shadow" />
          <span className="ambient-edge-label ambient-edge-label--newsletter">FROM KASHMIR, WITH CARE</span>
        </>
      )}
    </div>
  );
}

function BotanicalStem({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 520" fill="none">
      <path className="ambient-draw" d="M113 500C102 425 119 350 111 278C103 205 76 137 95 35" />
      <path className="ambient-draw ambient-draw--delay-1" d="M110 389C76 375 54 350 47 318C78 318 101 334 112 359" />
      <path className="ambient-draw ambient-draw--delay-2" d="M113 326C147 307 166 280 169 246C140 249 120 267 110 294" />
      <path className="ambient-draw ambient-draw--delay-3" d="M105 245C72 226 56 201 57 171C84 176 103 195 111 217" />
      <path className="ambient-draw ambient-draw--delay-4" d="M101 170C127 151 140 126 137 99C114 105 100 121 94 143" />
      <path className="ambient-draw ambient-draw--delay-5" d="M96 93C74 78 65 59 70 38C89 45 99 58 99 75" />
      <path className="ambient-draw ambient-draw--delay-4" d="M95 35C107 20 109 8 101 1C91 12 89 23 95 35Z" />
    </svg>
  );
}

function SaffronThreads({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 360 180" fill="none">
      <path className="ambient-thread ambient-thread--one" d="M8 151C72 132 84 65 151 48C218 31 248 74 344 22" />
      <path className="ambient-thread ambient-thread--two" d="M19 172C99 162 121 94 189 83C255 72 286 107 354 75" />
      <path className="ambient-thread ambient-thread--three" d="M64 178C114 139 135 122 184 117C241 111 283 140 337 120" />
    </svg>
  );
}

function BotanicalSeal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 180 180" fill="none">
      <defs>
        <path id="skin-shop-seal-path" d="M90,90 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
      </defs>
      <circle cx="90" cy="90" r="72" className="ambient-seal-ring" />
      <circle cx="90" cy="90" r="47" className="ambient-seal-ring ambient-seal-ring--inner" />
      <text className="ambient-seal-text">
        <textPath href="#skin-shop-seal-path" startOffset="0%">
          THE SKIN SHOP • KASHMIR • BOTANICAL RITUAL •
        </textPath>
      </text>
      <path className="ambient-seal-sprig" d="M90 112V70M90 96C76 93 68 84 67 72C78 73 87 80 90 89M90 86C104 83 112 74 113 62C102 63 93 70 90 79" />
    </svg>
  );
}

function CornerMotif({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 220" fill="none">
      <path className="ambient-corner-line" d="M12 108V12H108" />
      <path className="ambient-corner-line ambient-corner-line--delay" d="M33 108V33H108" />
      <path className="ambient-corner-line ambient-corner-line--delay-2" d="M54 108V54H108" />
      <path className="ambient-corner-diamond" d="M121 30L143 52L121 74L99 52L121 30Z" />
      <path className="ambient-corner-diamond ambient-corner-diamond--small" d="M165 72L179 86L165 100L151 86L165 72Z" />
    </svg>
  );
}

function LeafShadow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 300" fill="none">
      <g className="ambient-leaf-shadow-group">
        <path d="M40 260C108 199 158 135 205 42" />
        <ellipse cx="122" cy="181" rx="58" ry="20" transform="rotate(-38 122 181)" />
        <ellipse cx="174" cy="114" rx="54" ry="18" transform="rotate(26 174 114)" />
        <ellipse cx="230" cy="77" rx="49" ry="17" transform="rotate(-34 230 77)" />
        <path d="M217 281C274 216 318 155 358 55" />
        <ellipse cx="287" cy="204" rx="52" ry="18" transform="rotate(-28 287 204)" />
        <ellipse cx="337" cy="137" rx="56" ry="19" transform="rotate(32 337 137)" />
        <ellipse cx="382" cy="81" rx="47" ry="16" transform="rotate(-27 382 81)" />
      </g>
    </svg>
  );
}
