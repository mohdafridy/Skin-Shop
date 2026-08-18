"use client";

import { usePathname } from "next/navigation";
import { announcementMessage } from "@/data/navigation";

/** Hidden during checkout — once a shopper decides to buy, the site stops
 * selling and gets quiet (no promo bar, no editorial nav) — and on /admin,
 * which isn't storefront at all. */
export default function AnnouncementBar() {
  const pathname = usePathname();
  if (pathname === "/checkout" || pathname.startsWith("/admin")) return null;

  return (
    <div className="flex h-8 items-center justify-center bg-wine px-4 sm:h-9">
      <p className="text-center font-sans text-[11px] font-medium leading-none tracking-[0.06em] text-ivory sm:text-xs">
        {announcementMessage}
      </p>
    </div>
  );
}
