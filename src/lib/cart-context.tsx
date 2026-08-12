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
import { validateCoupon, type CouponCartLine } from "@/data/coupons";

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
  applyCoupon: (code: string) => { valid: boolean; reason?: string };
  removeCoupon: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);

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
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
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
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const currency = items[0]?.currency ?? "INR";
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const discount = useMemo(() => {
    if (!couponCode) return 0;
    const lines: CouponCartLine[] = items.map((i) => ({ type: i.type, slug: i.slug }));
    const result = validateCoupon(couponCode, { lines, subtotal });
    return result.valid ? result.discount : 0;
  }, [couponCode, items, subtotal]);

  const applyCoupon = useCallback(
    (code: string) => {
      const lines: CouponCartLine[] = items.map((i) => ({ type: i.type, slug: i.slug }));
      const result = validateCoupon(code, { lines, subtotal });
      if (result.valid) {
        setCouponCode(code.trim().toUpperCase());
        return { valid: true };
      }
      return { valid: false, reason: result.reason };
    },
    [items, subtotal],
  );

  const removeCoupon = useCallback(() => setCouponCode(null), []);

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
