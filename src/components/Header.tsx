import Link from "next/link";
import CartLink from "@/components/CartLink";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          Petal &amp; Skin
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          <Link href="/shop" className="transition hover:text-sage-dark">
            Shop All
          </Link>
          <Link href="/shop?category=serums" className="transition hover:text-sage-dark">
            Serums
          </Link>
          <Link href="/shop?category=moisturizers" className="transition hover:text-sage-dark">
            Moisturizers
          </Link>
          <Link href="/shop?category=cleansers" className="transition hover:text-sage-dark">
            Cleansers
          </Link>
        </nav>
        <CartLink />
      </div>
    </header>
  );
}
