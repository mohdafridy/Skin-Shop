"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogoutAction } from "./actions";

const navLinks = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/products", label: "Products" },
];

export default function AdminHeader({ title }: { title: string }) {
  const pathname = usePathname();

  return (
    <div className="mb-8 border-b border-gold/20 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
            The Skin Shop — Admin
          </Link>
          <h1 className="mt-1 font-display text-3xl text-ink">{title}</h1>
        </div>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-ivory"
          >
            Sign Out
          </button>
        </form>
      </div>

      <nav className="mt-5 flex gap-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              pathname === link.href
                ? "bg-burgundy text-ivory"
                : "border border-gold/30 text-walnut/75 hover:border-burgundy"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
