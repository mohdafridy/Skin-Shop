/**
 * No analytics provider (GA4, Segment, etc.) is connected yet. track() is a
 * stable call site wired throughout the site — connecting a real provider
 * later means implementing the body here, not touching any of the call
 * sites. Never fabricate a tracking ID or forward events to an invented
 * endpoint in the meantime.
 */
export type AnalyticsEvent =
  | { name: "view_product"; slug: string; price: number; currency: string }
  | { name: "view_combo"; slug: string; price: number; currency: string }
  | { name: "search"; query: string; resultCount: number }
  | { name: "hero_cta_click"; cta: string }
  | { name: "ingredient_product_click"; ingredient: string; productSlug: string }
  | { name: "add_to_cart"; slug: string; quantity: number; price: number; currency: string }
  | { name: "combo_add_to_cart"; slug: string; price: number; currency: string }
  | { name: "remove_from_cart"; key: string }
  | { name: "view_cart"; itemCount: number; subtotal: number }
  | { name: "begin_checkout"; itemCount: number; subtotal: number; currency: string }
  | { name: "add_shipping_info" }
  | { name: "add_payment_info" }
  | { name: "purchase"; orderNumber: string; total: number; currency: string }
  | { name: "whatsapp_click"; source: "floating" | "footer" | "contact" | "cart_order" }
  | { name: "instagram_click"; source: "footer" | "contact" | "cart_order" }
  | { name: "wishlist_add"; slug: string }
  | { name: "wishlist_remove"; slug: string };

export function track(event: AnalyticsEvent) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event.name, event);
  }
  // TODO: forward to a real provider once one is connected. Intentionally
  // a no-op in production until then.
}
