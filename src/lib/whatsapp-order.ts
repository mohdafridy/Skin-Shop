import type { CartItem } from "./cart-context";
import { formatPrice } from "./format";

/** Builds a plain-text order summary for the "Order via WhatsApp" flow —
 * mirrors what the customer sees in the cart drawer so support can act on
 * it directly without asking follow-up questions. */
export function buildWhatsAppOrderMessage(items: CartItem[], total: number, currency: string): string {
  const lines = items.map(
    (item) => `• ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity, item.currency)}`,
  );
  return [
    "Hi! I'd like to order the following from The Skin Shop:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total, currency)}`,
    "",
    "My delivery address:",
  ].join("\n");
}
