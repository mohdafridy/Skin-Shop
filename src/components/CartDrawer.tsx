"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import SmartImage from "./SmartImage";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, itemCount, subtotal, currency } =
    useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  // Reset transient UI state as soon as the open/closed state flips, rather
  // than in a follow-up effect (see https://react.dev/learn/you-might-not-need-an-effect).
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setCheckoutNotice(false);
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

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-300 ease-out ${
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
            <p className="font-display text-xl text-ink">Your bag is empty</p>
            <p className="max-w-xs text-sm text-walnut/70">
              Begin your ritual — explore cleansers, serums and creams from the collection.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-2 rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
            >
              Shop The Collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-gold/15 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-4 py-5">
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
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="font-medium text-ink hover:text-burgundy"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-walnut/70">
                        {item.category}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-gold/30">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-ink transition hover:text-burgundy"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          &minus;
                        </button>
                        <span className="w-5 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-ink transition hover:text-burgundy"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        className="text-xs text-walnut/70 underline-offset-2 transition hover:text-burgundy hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-gold/25 px-6 py-6">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-walnut/70">Subtotal</span>
                <span className="font-medium text-ink">
                  {subtotal === null ? "Confirmed at checkout" : formatPrice(subtotal, currency)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutNotice(true)}
                className="w-full rounded-full bg-burgundy px-6 py-3.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
              >
                Checkout
              </button>
              <p className="mt-3 text-center text-xs text-walnut/70" role="status">
                {checkoutNotice
                  ? "Checkout is launching soon — your bag is saved for when it does."
                  : "Shipping and taxes calculated at checkout."}
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
