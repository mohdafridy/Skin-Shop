"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/data/products";
import type { Combo } from "@/data/combos";
import { track } from "@/lib/analytics";

const STORAGE_KEY = "the-skin-shop-cart";

export type CartItemType = "product" | "combo";

export type CartItem = {
  type: CartItemType;
  /** Unique cart line key: `${type}:${slug}`. Use this for remove/update,
   * never the bare slug — a product and a combo could otherwise collide. */
  key: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  price: number;
  currency: string;
  quantity: number;
};

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === "string" &&
    typeof v.slug === "string" &&
    typeof v.name === "string" &&
    typeof v.price === "number" &&
    typeof v.quantity === "number"
  );
}

/** Older localStorage carts (pre-combo-support) stored plain product lines
 * with no `type`/`key`. Migrate them forward instead of discarding. */
function migrateStoredItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry): CartItem | null => {
      if (isCartItem(entry)) return entry;
      if (
        entry &&
        typeof entry === "object" &&
        typeof (entry as Record<string, unknown>).slug === "string" &&
        typeof (entry as Record<string, unknown>).quantity === "number"
      ) {
        const e = entry as Record<string, unknown>;
        if (typeof e.price !== "number") return null;
        return {
          type: "product",
          key: `product:${e.slug}`,
          slug: e.slug as string,
          name: (e.name as string) ?? (e.slug as string),
          image: (e.image as string) ?? "",
          category: (e.category as string) ?? "",
          price: e.price,
          currency: (e.currency as string) ?? "INR",
          quantity: e.quantity as number,
        };
      }
      return null;
    })
    .filter((item): item is CartItem => item !== null);
}

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  addCombo: (combo: Combo, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  currency: string;
  subtotal: number;
  couponCode: string | null;
  discount: number;
  applyCoupon: (code: string) => Promise<{ valid: boolean; reason?: string }>;
  removeCoupon: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(migrateStoredItems(parsed.items ?? parsed));
        if (typeof parsed.couponCode === "string") setCouponCode(parsed.couponCode);
      }
    } catch {
      // ignore corrupted local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, couponCode }));
  }, [items, couponCode, hydrated]);

  const addItem = useCallback<CartContextValue["addItem"]>((product, quantity = 1) => {
    const key = `product:${product.slug}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          type: "product",
          key,
          slug: product.slug,
          name: product.shortName ?? product.name,
          image: product.image,
          category: product.category,
          price: product.price,
          currency: product.currency,
          quantity,
        },
      ];
    });
    setIsOpen(true);
    track({ name: "add_to_cart", slug: product.slug, quantity, price: product.price, currency: product.currency });
  }, []);

  const addCombo = useCallback<CartContextValue["addCombo"]>((combo, quantity = 1) => {
    const key = `combo:${combo.slug}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          type: "combo",
          key,
          slug: combo.slug,
          name: combo.name,
          image: combo.image,
          category: "Ritual Combo",
          price: combo.price,
          currency: combo.currency,
          quantity,
        },
      ];
    });
    setIsOpen(true);
    track({ name: "combo_add_to_cart", slug: combo.slug, price: combo.price, currency: combo.currency });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
    track({ name: "remove_from_cart", key });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.key !== key);
      return prev.map((i) => (i.key === key ? { ...i, quantity } : i));
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode(null);
    setAppliedDiscount(0);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const currency = items[0]?.currency ?? "INR";
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  // Coupons are validated server-side against the database (the same codes
  // the owner generates in /admin/coupons), never a static list — so
  // admin-issued codes actually work. The checkout API re-validates and is
  // the authoritative source; this is the live in-cart preview.
  const discount = useMemo(
    () => (couponCode ? Math.min(appliedDiscount, subtotal) : 0),
    [couponCode, appliedDiscount, subtotal],
  );

  async function validateCouponRemotely(code: string, forSubtotal: number) {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal: forSubtotal }),
    });
    const data = (await res.json().catch(() => null)) as
      | { valid?: boolean; discount?: number; message?: string }
      | null;
    return { ok: res.ok, data };
  }

  // Keep the applied discount in step with the cart: re-check the code against
  // the database whenever the code or subtotal changes. Only drop a code the
  // server explicitly rejects (used, expired, below minimum); a transient
  // network/server error leaves it in place — checkout will re-validate.
  useEffect(() => {
    // Nothing to validate without a code or a positive subtotal. The discount
    // memo already reports 0 in that case, so no state reset is needed here.
    if (!couponCode || subtotal <= 0) return;
    let cancelled = false;
    (async () => {
      try {
        const { ok, data } = await validateCouponRemotely(couponCode, subtotal);
        if (cancelled) return;
        if (data?.valid) {
          setAppliedDiscount(data.discount ?? 0);
        } else if (ok) {
          setAppliedDiscount(0);
          setCouponCode(null);
        }
      } catch {
        /* keep the current code/discount; checkout re-validates */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [couponCode, subtotal]);

  const applyCoupon = useCallback(
    async (code: string) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return { valid: false, reason: "Enter a coupon code." };
      try {
        const { data } = await validateCouponRemotely(trimmed, subtotal);
        if (data?.valid) {
          setCouponCode(trimmed);
          setAppliedDiscount(data.discount ?? 0);
          return { valid: true };
        }
        return { valid: false, reason: data?.message ?? "That code isn't valid." };
      } catch {
        return { valid: false, reason: "Couldn't check that code. Please try again." };
      }
    },
    [subtotal],
  );

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setAppliedDiscount(0);
  }, []);

  const total = subtotal - discount;

  const value = useMemo(
    () => ({
      items,
      isOpen,
      openCart,
      closeCart,
      addItem,
      addCombo,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      currency,
      subtotal,
      couponCode,
      discount,
      applyCoupon,
      removeCoupon,
      total,
    }),
    [
      items,
      isOpen,
      openCart,
      closeCart,
      addItem,
      addCombo,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      currency,
      subtotal,
      couponCode,
      discount,
      applyCoupon,
      removeCoupon,
      total,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
