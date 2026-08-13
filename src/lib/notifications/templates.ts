import type { OrderEventType } from "@prisma/client";

/**
 * Central mapping from an order event to the notification it produces.
 * Template names live here (overridable by env) rather than being spread
 * through the codebase, because Meta template names are chosen at approval
 * time and will not be known until the client submits them.
 *
 * See WHATSAPP_TEMPLATES.md for the exact body text and parameter order
 * each template must be created with.
 */

export const storeName = "The Skin Shop";

/** Server-side canonical site URL. Falls back to the public var the rest of
 * the app already uses, then to localhost for development. */
export function siteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** Which events notify the customer at all. Internal-only transitions
 * (PACKED, PROCESSING) deliberately stay silent — the customer does not
 * need a message every time a box moves inside the studio. */
export type NotifiableEvent = Extract<
  OrderEventType,
  | "PAYMENT_SUCCESSFUL"
  | "PAYMENT_FAILED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUND_INITIATED"
  | "REFUNDED"
>;

export const notifiableEvents: NotifiableEvent[] = [
  "PAYMENT_SUCCESSFUL",
  "PAYMENT_FAILED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUND_INITIATED",
  "REFUNDED",
];

export function isNotifiableEvent(event: OrderEventType): event is NotifiableEvent {
  return (notifiableEvents as OrderEventType[]).includes(event);
}

/** Env var holding each event's approved Meta template name, and the
 * suggested name to submit for approval. */
const whatsappTemplateConfig: Record<
  NotifiableEvent,
  { envVar: string; suggestedName: string }
> = {
  PAYMENT_SUCCESSFUL: { envVar: "WHATSAPP_TEMPLATE_ORDER_CONFIRMED", suggestedName: "order_confirmed" },
  PAYMENT_FAILED: { envVar: "WHATSAPP_TEMPLATE_PAYMENT_FAILED", suggestedName: "payment_failed" },
  SHIPPED: { envVar: "WHATSAPP_TEMPLATE_ORDER_SHIPPED", suggestedName: "order_shipped" },
  OUT_FOR_DELIVERY: { envVar: "WHATSAPP_TEMPLATE_OUT_FOR_DELIVERY", suggestedName: "order_out_for_delivery" },
  DELIVERED: { envVar: "WHATSAPP_TEMPLATE_ORDER_DELIVERED", suggestedName: "order_delivered" },
  CANCELLED: { envVar: "WHATSAPP_TEMPLATE_ORDER_CANCELLED", suggestedName: "order_cancelled" },
  REFUND_INITIATED: { envVar: "WHATSAPP_TEMPLATE_REFUND_INITIATED", suggestedName: "refund_initiated" },
  REFUNDED: { envVar: "WHATSAPP_TEMPLATE_REFUND_COMPLETED", suggestedName: "refund_completed" },
};

/**
 * Resolves the approved template name for an event. Falls back to the
 * suggested name so a client who used the suggested names verbatim needs no
 * extra env vars — but the env var always wins if their approved name
 * differs, which is common.
 */
export function whatsappTemplateName(event: NotifiableEvent): string {
  const config = whatsappTemplateConfig[event];
  return process.env[config.envVar] || config.suggestedName;
}

export function whatsappLanguageCode(): string {
  return process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en";
}

/** Subject lines for the email channel. */
export const emailSubjects: Record<NotifiableEvent, (orderNumber: string) => string> = {
  PAYMENT_SUCCESSFUL: (n) => `Your ${storeName} order ${n} is confirmed`,
  PAYMENT_FAILED: (n) => `Payment couldn't be completed for order ${n}`,
  SHIPPED: (n) => `Your ${storeName} order ${n} has shipped`,
  OUT_FOR_DELIVERY: (n) => `Order ${n} is out for delivery today`,
  DELIVERED: (n) => `Order ${n} has been delivered`,
  CANCELLED: (n) => `Order ${n} has been cancelled`,
  REFUND_INITIATED: (n) => `Refund initiated for order ${n}`,
  REFUNDED: (n) => `Refund completed for order ${n}`,
};

export { whatsappTemplateConfig };
