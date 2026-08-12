"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

/** Empties the persistent cart once a real, verified order confirmation
 * renders. Buy Now orders never touched the cart, so this is a no-op for
 * those — clearCart() on an already-empty cart is harmless. */
export default function ClearCartOnSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
