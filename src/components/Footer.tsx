export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream-dark/60">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl text-ink">Petal &amp; Skin</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
              Clean, effective skincare made with thoughtfully sourced
              ingredients for every skin type.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>Cleansers</li>
              <li>Serums</li>
              <li>Moisturizers</li>
              <li>Sunscreen</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Get in touch</p>
            <p className="mt-3 text-sm text-ink-soft">hello@petalandskin.com</p>
            <p className="mt-1 text-sm text-ink-soft">Mon&ndash;Fri, 9am&ndash;6pm</p>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs text-ink-soft">
          &copy; {new Date().getFullYear()} Petal &amp; Skin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
