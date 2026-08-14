"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
  /** "fade" (default) is the shared card/section reveal used everywhere.
   * "image" is reserved for major story photography — a slightly slower,
   * more photographic clip+scale reveal (see .image-reveal in globals.css).
   * Use "image" sparingly, per the site's own restraint about not
   * animating every element differently. */
  variant?: "fade" | "image";
};

export default function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
  variant = "fade",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  const base = variant === "image" ? "image-reveal" : "reveal";

  return (
    <Tag
      ref={ref as never}
      className={`${base} ${inView ? "in-view" : ""} ${className}`}
      style={{ animationDelay: inView ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
