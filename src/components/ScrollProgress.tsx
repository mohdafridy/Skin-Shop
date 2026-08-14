"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * A near-invisible page-progress hairline along the right edge — desktop
 * only, not interactive, and directly scroll-linked (no eased transition —
 * a progress indicator should track the scroll position exactly, not lag
 * behind it). Hidden on /admin (internal tool) and /checkout (kept the
 * calmest, least-decorated part of the site).
 */
export default function ScrollProgress() {
  const pathname = usePathname();
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    function update() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${ratio})`;
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  if (pathname.startsWith("/admin") || pathname === "/checkout") return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-0 top-0 z-40 hidden h-screen w-px bg-[rgba(69,48,42,0.08)] lg:block"
    >
      <div ref={fillRef} className="h-full w-full origin-top bg-gold/60" style={{ transform: "scaleY(0)" }} />
    </div>
  );
}
