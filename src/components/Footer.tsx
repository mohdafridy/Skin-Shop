"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { footerColumns, brandLine, productTagline } from "@/data/navigation";
import { contactEmail, contactPhoneDisplay, whatsappLink } from "@/data/contact";
import Logo from "./Logo";
import SectionDivider from "./SectionDivider";

export default function Footer() {
  const pathname = usePathname();
  // /admin is an internal tool, not storefront — no footer there.
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-28 bg-walnut text-sand">
      <div className="py-10">
        <SectionDivider />
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-12 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="text-sand">
              <Logo />
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-gold">
              {productTagline}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand/70">
              Organic, botanical skincare, body care and hair care — handcrafted in
              Kashmir and shipped across India.
            </p>
            <div className="mt-5 space-y-1.5 text-sm text-sand/80">
              <a href={`mailto:${contactEmail}`} className="block transition hover:text-ivory">
                {contactEmail}
              </a>
              <a
                href={whatsappLink("Hi! I have a question about The Skin Shop.")}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-ivory"
              >
                {contactPhoneDisplay} (WhatsApp)
              </a>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-sand/80 transition hover:text-ivory"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-3 border-t border-sand/15 pt-6 text-xs text-sand/60 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm text-sand/80">{brandLine}</p>
          <p>&copy; {new Date().getFullYear()} The Skin Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
