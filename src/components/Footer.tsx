"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { footerColumns, productTagline, foundedYear } from "@/data/navigation";
import { contactEmail, contactPhoneDisplay, whatsappLink } from "@/data/contact";
import Logo from "./Logo";
import SectionDivider from "./SectionDivider";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-walnut text-sand">
      <div className="py-9"><SectionDivider /></div>

      <div className="mx-auto max-w-standard px-6 pb-12 sm:px-8 lg:pb-16">
        <div className="border-b border-sand/14 pb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-gold">{productTagline}</p>
              <p className="mt-3 font-display text-[clamp(3.5rem,8vw,8rem)] leading-[0.78] tracking-[-0.055em] text-ivory">
                The Skin Shop
              </p>
            </div>
            <div className="max-w-sm lg:text-right">
              <p className="text-sm leading-[1.75] text-sand/62">
                Organic, botanical skincare, body care and hair care — handcrafted in Kashmir and shipped across India.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-12 pt-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="mark" />
            <div className="mt-5 space-y-2 text-sm text-sand/72">
              <a href={`mailto:${contactEmail}`} className="block transition-colors hover:text-ivory">{contactEmail}</a>
              <a
                href={whatsappLink("Hi! I have a question about The Skin Shop.")}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-ivory"
              >
                {contactPhoneDisplay} (WhatsApp)
              </a>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-gold">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="group inline-flex items-center gap-2 text-sm text-sand/68 transition-colors hover:text-ivory"
                      >
                        {link.label}
                        <span aria-hidden="true" className="translate-x-[-3px] text-gold opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100">→</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="pashmina-footer-border" aria-hidden="true" />

      <div className="border-t border-sand/12 bg-walnut">
        <div className="mx-auto flex max-w-standard flex-col items-start gap-3 px-6 py-6 text-xs text-sand/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="font-display text-base tracking-[-0.01em] text-sand/75">Botanical skincare, thoughtfully made in Kashmir.</p>
          <p>&copy; {foundedYear}–{new Date().getFullYear()} The Skin Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
