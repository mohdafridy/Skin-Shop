"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { getCartSuggestion, getComboPricing } from "@/data/combos";
import { getProductBySlug } from "@/data/products";
import { whatsappLink, instagramUrl } from "@/data/contact";
import { buildWhatsAppOrderMessage } from "@/lib/whatsapp-order";
import { track } from "@/lib/analytics";
import { WhatsAppIcon, InstagramIcon } from "./icons";
import SmartImage from "./SmartImage";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    addItem,
    itemCount,
    currency,
    subtotal,
    couponCode,
    discount,
    applyCoupon,
    removeCoupon,
    total,
  } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const suggestion = useMemo(() => {
    const productSlugs = items.filter((i) => i.type === "product").map((i) => i.slug);
    const comboSlugs = items.filter((i) => i.type === "combo").map((i) => i.slug);
    return getCartSuggestion(productSlugs, comboSlugs);
  }, [items]);

  // Reset transient UI state as soon as the open/closed state flips, rather
  // than in a follow-up effect (see https://react.dev/learn/you-might-not-need-an-effect).
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setCouponInput("");
      setCouponError(null);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const result = applyCoupon(couponInput);
    if (!result.valid) {
      setCouponError(result.reason ?? "That code isn't valid.");
      return;
    }
    setCouponError(null);
    setCouponInput("");
  }

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-[rgba(30,22,18,0.28)] transition-opacity duration-300 ease-premium ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-300 ease-premium ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold/25 px-6 py-5">
          <h2 className="font-display text-2xl text-ink">
            Your Bag {itemCount > 0 && <span className="text-walnut/70">({itemCount})</span>}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-sand"
          >
            <span aria-hidden>&times;</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-xl text-ink">Your ritual is waiting.</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-2 rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
            >
              Explore The Collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-gold/15 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    label={item.name}
                    className="h-20 w-20 flex-shrink-0 rounded-lg"
                    sizes="80px"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={item.type === "combo" ? `/rituals#${item.slug}` : `/products/${item.slug}`}
                        onClick={closeCart}
                        className="font-medium text-ink hover:text-burgundy"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-2 text-xs uppercase tracking-wide text-walnut/70">
                        {item.category}
                        <span aria-hidden="true">·</span>
                        {formatPrice(item.price, item.currency)} each
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-gold/30">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-ink transition-colors duration-150 ease-premium hover:text-burgundy active:scale-90"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          &minus;
                        </button>
                        <span key={item.quantity} className="qty-pulse w-5 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-ink transition-colors duration-150 ease-premium hover:text-burgundy active:scale-90"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <span key={item.quantity} className="qty-pulse text-sm font-medium text-ink">
                        {formatPrice(item.price * item.quantity, item.currency)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${item.name}`}
                    className="flex-shrink-0 self-start text-walnut/50 transition hover:text-burgundy"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {suggestion && (
              <div className="mx-6 mb-2 rounded-2xl border border-gold/20 bg-sand/40 p-4">
                {suggestion.kind === "complete-ritual" ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-burgundy">
                      You&apos;re already building {suggestion.combo.name}
                    </p>
                    <p className="mt-1 text-sm text-walnut/75">
                      Discover the complete ritual — save{" "}
                      {formatPrice(getComboPricing(suggestion.combo).savings, suggestion.combo.currency)} when
                      bundled.
                    </p>
                    <Link
                      href={`/rituals#${suggestion.combo.slug}`}
                      onClick={closeCart}
                      className="mt-2 inline-block text-xs font-medium text-burgundy underline-offset-2 hover:underline"
                    >
                      View The Ritual →
                    </Link>
                  </>
                ) : (
                  (() => {
                    const product = getProductBySlug(suggestion.missingSlug);
                    if (!product) return null;
                    return (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-wide text-burgundy">
                          Continue The {suggestion.combo.name.replace(/ Combo$/, "")} Ritual
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <SmartImage
                            src={product.image}
                            alt={product.name}
                            label={product.shortName ?? product.name}
                            className="h-12 w-12 flex-shrink-0 rounded-lg"
                            sizes="48px"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">
                              {product.shortName ?? product.name}
                            </p>
                            <p className="text-xs text-walnut/70">{formatPrice(product.price, product.currency)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addItem(product)}
                            className="flex-shrink-0 rounded-full border border-burgundy px-3 py-1.5 text-xs font-medium text-burgundy transition hover:bg-burgundy hover:text-ivory"
                          >
                            + Add
                          </button>
                        </div>
                      </>
                    );
                  })()
                )}
              </div>
            )}

            <div className="border-t border-gold/25 px-6 py-6">
              {couponCode && discount > 0 ? (
                <div className="mb-4 flex items-center justify-between rounded-full bg-olive/10 px-4 py-2 text-xs text-olive">
                  <span>
                    Code <span className="font-semibold">{couponCode}</span> applied
                  </span>
                  <button type="button" onClick={removeCoupon} className="underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="mb-4 flex gap-2">
                  <label htmlFor="cart-coupon" className="sr-only">
                    Coupon code
                  </label>
                  <input
                    id="cart-coupon"
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError(null);
                    }}
                    placeholder="Coupon code"
                    className="w-full min-w-0 rounded-full border border-gold/30 bg-white/60 px-4 py-2 text-sm text-ink placeholder:text-walnut/40 focus:outline-none focus:ring-2 focus:ring-burgundy/50"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 rounded-full border border-ink px-4 py-2 text-xs font-medium text-ink transition hover:bg-ink hover:text-ivory"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="-mt-2 mb-4 text-xs text-burgundy" role="alert">
                  {couponError}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-walnut/70">Subtotal</span>
                  <span className="font-medium text-ink">{formatPrice(subtotal, currency)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-olive">
                    <span>Discount</span>
                    <span>&minus;{formatPrice(discount, currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-walnut/70">Shipping</span>
                  <span className="text-walnut/70">Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between border-t border-gold/20 pt-2 text-base font-medium text-ink">
                  <span>Total</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-5 block w-full rounded-full bg-burgundy px-6 py-3.5 text-center text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
              >
                Checkout
              </Link>
              <a
                href={whatsappLink(buildWhatsAppOrderMessage(items, total, currency))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track({ name: "whatsapp_click", source: "cart_order" })}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-gold/30 px-6 py-3 text-center text-sm font-medium text-ink transition hover:border-[#25D366] hover:text-[#1DA851]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Order via WhatsApp
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track({ name: "instagram_click", source: "cart_order" })}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-gold/30 px-6 py-3 text-center text-sm font-medium text-ink transition hover:border-burgundy hover:text-burgundy"
              >
                <InstagramIcon className="h-4 w-4" />
                Order via Instagram
              </a>
              <button
                type="button"
                onClick={closeCart}
                className="mt-2 w-full rounded-full px-6 py-3 text-center text-sm font-medium text-walnut/70 transition hover:text-ink"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
