import Link from "next/link";
import { footerColumns, brandLine } from "@/data/navigation";
import Logo from "./Logo";
import SectionDivider from "./SectionDivider";

export default function Footer() {
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
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand/70">
              Botanical skincare, body care and hair care, formulated with a sense of
              place.
            </p>
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
