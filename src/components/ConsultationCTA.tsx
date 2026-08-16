"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/data/contact";
import { buildConsultationWhatsAppMessage } from "@/lib/whatsapp-order";
import { absoluteUrl } from "@/lib/seo";
import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "./icons";

/**
 * Secondary, optional path for shoppers unsure which product suits them —
 * sits below Add to Cart/Buy Now, never above or in place of it. Opens
 * WhatsApp with a pre-filled consultation request; a human consultant
 * takes it from there and assists with the order manually (no automatic
 * order or payment is created from this click).
 */
export default function ConsultationCTA({
  productSlug,
  productName,
  price,
  currency,
}: {
  productSlug: string;
  productName: string;
  price?: number;
  currency?: string;
}) {
  const pathname = usePathname();
  const message = buildConsultationWhatsAppMessage({
    productName,
    productUrl: absoluteUrl(`/products/${productSlug}`),
    price,
    currency,
  });

  return (
    <div className="mt-6 rounded-md border border-gold/25 bg-sand/25 p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-walnut/60">
        Need help choosing?
      </p>
      <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink">
        FREE Personalised Skin Consultation
      </p>
      <p className="mt-2 text-sm leading-relaxed text-walnut/75">
        Tell us your skin type, concerns and routine, and we&apos;ll help you choose what suits
        you — or place your full order for you, personally, over WhatsApp.
      </p>
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          track({
            name: "whatsapp_consultation_clicked",
            productSlug,
            productName,
            pagePath: pathname,
          })
        }
        aria-label={`Get a free skin consultation for ${productName} on WhatsApp`}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-burgundy/40 px-5 py-3.5 text-sm font-medium text-burgundy transition-colors duration-200 ease-premium hover:border-burgundy hover:bg-burgundy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 sm:w-auto"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Chat &amp; Order on WhatsApp
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
