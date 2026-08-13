"use client";

import { usePathname } from "next/navigation";
import { announcementMessage } from "@/data/navigation";

/** Hidden during checkout — once a shopper decides to buy, the site stops
 * selling and gets quiet (no promo bar, no editorial nav). */
export default function AnnouncementBar() {
  const pathname = usePathname();
  if (pathname === "/checkout") return null;

  return (
    <div className="flex h-8 items-center justify-center bg-wine px-4 sm:h-9">
      <p className="text-center font-display text-sm tracking-wide text-ivory sm:text-base">
        {announcementMessage}
      </p>
    </div>
  );
}
