"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  until: string;
  /** Overlay on product photography, or sit beside the product category. */
  placement?: "overlay" | "inline";
};

/**
 * One tasteful entrance + a single gold-light sweep, driven by the Web
 * Animations API (JavaScript). Never loops or flashes. Respect reduced-motion.
 * The timer also removes the badge from an already-open page at expiration.
 */
export default function NewArrivalBadge({ until, placement = "overlay" }: Props) {
  const [visible, setVisible] = useState(() => Date.parse(until) > Date.now());
  const badgeRef = useRef<HTMLSpanElement>(null);
  const shineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Browser timers are capped at ~24.8 days; reschedule in chunks so
    // 60- and 90-day badges still expire in a tab left open for weeks.
    let timer: number | undefined;
    function checkExpiry() {
      const remaining = Date.parse(until) - Date.now();
      if (remaining <= 0) {
        setVisible(false);
      } else {
        timer = window.setTimeout(checkExpiry, Math.min(remaining, 2147483647));
      }
    }
    timer = window.setTimeout(checkExpiry, 0);
    return () => { if (timer !== undefined) window.clearTimeout(timer); };
  }, [until]);

  useEffect(() => {
    if (!visible || !badgeRef.current || !shineRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const element = badgeRef.current;
    const shine = shineRef.current;
    let entrance: Animation | undefined;
    let sweep: Animation | undefined;
    const run = () => {
      if (typeof element.animate !== "function" || typeof shine.animate !== "function") return;
      entrance = element.animate(
        [
          { opacity: 0, transform: "translateY(9px) scale(0.97)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 620, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
      );
      sweep = shine.animate(
        [
          { opacity: 0, transform: "translateX(-170%)" },
          { opacity: 0.48, offset: 0.45, transform: "translateX(-10%)" },
          { opacity: 0, transform: "translateX(160%)" },
        ],
        { duration: 1100, delay: 330, easing: "ease-in-out", fill: "forwards" },
      );
    };

    if (!("IntersectionObserver" in window)) run();
    else {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          run();
        }
      }, { threshold: 0.15 });
      observer.observe(element);
      return () => { observer.disconnect(); entrance?.cancel(); sweep?.cancel(); };
    }
    return () => { entrance?.cancel(); sweep?.cancel(); };
  }, [visible, until]);

  if (!visible) return null;

  return (
    <span
      ref={badgeRef}
      aria-label="Newly launched product"
      className={
        "new-arrival-badge " +
        (placement === "overlay" ? "new-arrival-badge--overlay" : "new-arrival-badge--inline")
      }
    >
      <span aria-hidden="true" className="new-arrival-badge__spark">✦</span>
      <span className="relative z-[1]">NEW</span>
      <span ref={shineRef} aria-hidden="true" className="new-arrival-badge__shine" />
    </span>
  );
}
