"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/data/navigation";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { track } from "@/lib/analytics";
import { HeartIcon } from "./icons";
import Logo from "./Logo";
import SearchOverlay from "./SearchOverlay";

export default function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  const isCheckout = pathname === "/checkout";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, subtotal, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  // Tracked on every storefront page (not just home) so the header can
  // compact itself slightly on scroll everywhere — it never hides, cart and
  // search stay reachable throughout, only its height/background settle.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  const transparent = isHome && !scrolled;
  const textTone = transparent ? "text-ivory" : "text-ink";

  // /admin has its own header (AdminHeader) — the storefront chrome doesn't
  // belong on an internal tool.
  if (isAdmin) return null;

  if (isCheckout) {
    return (
      <header className="sticky top-0 z-50 h-[72px] border-b border-gold/20 bg-ivory/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-standard items-center justify-between px-5 text-ink sm:px-8">
          <Link href="/" className="flex-shrink-0" aria-label="The Skin Shop, home">
            <Logo />
          </Link>
          <p className="hidden text-xs font-medium uppercase tracking-[0.2em] text-walnut/60 sm:block">
            Contact <span className="mx-1 text-gold">→</span> Delivery
            <span className="mx-1 text-gold">→</span> Payment
            <span className="mx-1 text-gold">→</span> Confirmation
          </p>
          <button
            type="button"
            onClick={openCart}
            className="flex-shrink-0 text-sm font-medium text-walnut/70 underline-offset-2 transition hover:text-burgundy hover:underline"
          >
            Review Bag{itemCount > 0 ? ` (${itemCount})` : ""}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-[height,background-color,border-color,backdrop-filter] duration-300 ease-premium ${
        scrolled ? "h-16" : "h-[72px]"
      } ${
        transparent
          ? "bg-transparent"
          : "border-b border-[rgba(69,48,42,0.08)] bg-[rgba(247,242,233,0.94)] backdrop-blur-[12px]"
      }`}
    >
      <div className={`mx-auto flex h-full max-w-standard items-center justify-between px-5 sm:px-8 ${textTone}`}>
        <Link href="/" className="flex-shrink-0" aria-label="The Skin Shop, home">
          <Logo light={transparent} />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {mainNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative py-1 font-sans text-[0.9rem] font-medium tracking-wide"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-[180ms] ease-premium group-hover:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-11 w-11 items-center justify-center rounded-full transition hover:opacity-70"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? "" : "s"}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:opacity-70"
          >
            <HeartIcon className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-semibold text-ivory">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/account"
            aria-label="Account"
            className="hidden h-11 w-11 items-center justify-center rounded-full transition hover:opacity-70 sm:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path strokeLinecap="round" d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => {
              track({ name: "view_cart", itemCount, subtotal });
              openCart();
            }}
            aria-label={`Open bag, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:opacity-70"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5L6 8Z"
              />
              <path strokeLinecap="round" d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-semibold text-ivory">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full transition hover:opacity-70 lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className={`absolute inset-x-0 border-b border-[rgba(69,48,42,0.08)] bg-ivory px-6 py-7 text-ink shadow-lg transition-[top] duration-300 ease-premium lg:hidden ${
            scrolled ? "top-16" : "top-20"
          }`}
        >
          <nav className="flex flex-col gap-2" aria-label="Mobile">
            {mainNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg px-2 py-3.5 font-display text-xl transition hover:bg-sand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
