"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/data/contact";
import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "./icons";

/** Hidden during checkout, matching AnnouncementBar/Header's "quiet mode" —
 * once a shopper commits to paying, nothing should invite them away. Also
 * hidden on /admin, which isn't storefront. */
export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname === "/checkout" || pathname.startsWith("/admin")) return null;

  return (
    <a
      href={whatsappLink("Hi! I have a question about The Skin Shop.")}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track({ name: "whatsapp_click", source: "floating" })}
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
