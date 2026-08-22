"use client";

import { usePathname } from "next/navigation";

/**
 * A deliberately quiet route transition. It never delays navigation or
 * intercepts scrolling; keying by pathname simply lets the incoming page
 * receive the shared CSS entry treatment.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter min-h-full">
      {children}
    </div>
  );
}
