import type { CartItem } from "./cart-context";
import { formatPrice } from "./format";

/** Builds the pre-filled message for the "FREE Personalised Skin
 * Consultation" CTA on a product page — one reusable template instead of
 * per-product hardcoded text. Product name/URL are inserted automatically;
 * price is optional. */
export function buildConsultationWhatsAppMessage({
  productName,
  productUrl,
  price,
  currency,
}: {
  productName: string;
  productUrl?: string;
  price?: number;
  currency?: string;
}): string {
  const priceLine = price != null && currency ? ` (${formatPrice(price, currency)})` : "";
  return [
    `Hi! I'm interested in the ${productName}${priceLine}.`,
    ...(productUrl ? [productUrl] : []),
    "",
    "I'm not sure if it's right for my skin and would like a FREE personalised skin consultation.",
    "",
    "My skin concern is:",
    "",
    "I'd also like help placing my order through WhatsApp.",
  ].join("\n");
}

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
