import { Prisma, type NotificationChannel, type OrderEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { renderOrderEmail } from "./email-templates";
import { isEmailConfigured, sendEmail } from "./email";
import { isWhatsAppConfigured, sendWhatsAppTemplate } from "./whatsapp";
import {
  emailSubjects,
  isNotifiableEvent,
  siteUrl,
  storeName,
  whatsappLanguageCode,
  whatsappTemplateName,
  type NotifiableEvent,
} from "./templates";
import { orderForNotificationSelect, type OrderForNotification } from "./types";

export { isWhatsAppConfigured } from "./whatsapp";
export { isEmailConfigured } from "./email";
export type { OrderForNotification } from "./types";

/**
 * Positional template parameters, in the order documented in
 * WHATSAPP_TEMPLATES.md. Changing this order without re-approving the Meta
 * template will put the wrong value in the wrong slot, so the doc and this
 * function must always be edited together.
 */
function whatsappParameters(event: NotifiableEvent, order: OrderForNotification): string[] {
  const customer = order.customerName?.trim() || "there";
  const amount = formatPrice(order.total, order.currency);

  switch (event) {
    case "PAYMENT_SUCCESSFUL":
      return [customer, order.orderNumber, amount, storeName];
    case "PAYMENT_FAILED":
      return [customer, order.orderNumber, storeName];
    case "SHIPPED":
      return [
        customer,
        order.orderNumber,
        order.courierName ?? "our courier partner",
        order.trackingNumber ?? "not available yet",
        order.trackingUrl || `${siteUrl()}/track/${order.accessToken}`,
      ];
    case "OUT_FOR_DELIVERY":
      return [customer, order.orderNumber, order.courierName ?? "our courier partner"];
    case "DELIVERED":
      return [customer, order.orderNumber, storeName];
    case "CANCELLED":
      return [customer, order.orderNumber, storeName];
    case "REFUND_INITIATED":
      return [customer, order.orderNumber, amount];
    case "REFUNDED":
      return [customer, order.orderNumber, amount];
  }
}

/**
 * Claims the right to send one (order, event, channel) notification.
 *
 * The unique constraint is the lock: a second concurrent or redelivered
 * webhook loses the insert race and is told to stand down, so the customer
 * never receives two identical messages. A previously FAILED attempt is
 * reclaimable so genuine failures stay retryable.
 */
async function claim(
  orderId: string,
  eventType: OrderEventType,
  channel: NotificationChannel,
): Promise<{ claimed: boolean; id?: string }> {
  try {
    const row = await prisma.orderNotification.create({
      data: { orderId, eventType, channel, status: "PENDING", attempts: 1 },
    });
    return { claimed: true, id: row.id };
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
      throw error;
    }
    // Someone already holds this slot. Retry only if their attempt failed.
    const existing = await prisma.orderNotification.findUnique({
      where: { orderId_eventType_channel: { orderId, eventType, channel } },
    });
    if (!existing || existing.status !== "FAILED") return { claimed: false };

    const retaken = await prisma.orderNotification.updateMany({
      where: { id: existing.id, status: "FAILED" },
      data: { status: "PENDING", attempts: { increment: 1 }, error: null },
    });
    return retaken.count === 1 ? { claimed: true, id: existing.id } : { claimed: false };
  }
}

async function finish(
  id: string,
  result:
    | { status: "sent"; messageId: string | null }
    | { status: "skipped"; reason: string }
    | { status: "failed"; error: string },
) {
  if (result.status === "sent") {
    await prisma.orderNotification.update({
      where: { id },
      data: { status: "SENT", providerMessageId: result.messageId, sentAt: new Date(), error: null },
    });
    return;
  }
  if (result.status === "skipped") {
    await prisma.orderNotification.update({
      where: { id },
      data: { status: "SKIPPED", error: result.reason },
    });
    return;
  }
  await prisma.orderNotification.update({
    where: { id },
    data: { status: "FAILED", error: result.error.slice(0, 500) },
  });
}

export type NotifyOutcome = {
  event: OrderEventType;
  whatsapp: "sent" | "skipped" | "failed" | "deduplicated" | "not-applicable";
  email: "sent" | "skipped" | "failed" | "deduplicated" | "not-applicable";
};

/**
 * Single entry point for customer notifications.
 *
 * Never throws and never rejects: payment and fulfilment flows call this and
 * must not be reversed because a messaging provider was down. Every outcome —
 * including "provider not configured" — is recorded in OrderNotification so
 * failures are visible and retryable instead of silently lost.
 */
export async function notifyOrderEvent(
  orderId: string,
  eventType: OrderEventType,
): Promise<NotifyOutcome> {
  const outcome: NotifyOutcome = {
    event: eventType,
    whatsapp: "not-applicable",
    email: "not-applicable",
  };

  if (!isNotifiableEvent(eventType)) return outcome;

  let order: OrderForNotification | null = null;
  try {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      select: orderForNotificationSelect,
    });
  } catch (error) {
    console.error("notify_order_event_load_failed", { orderId, eventType, error });
    return outcome;
  }
  if (!order) {
    console.warn("notify_order_event_missing_order", { orderId, eventType });
    return outcome;
  }

  // --- WhatsApp ---------------------------------------------------------
  try {
    const slot = await claim(order.id, eventType, "WHATSAPP");
    if (!slot.claimed) {
      outcome.whatsapp = "deduplicated";
    } else {
      if (!isWhatsAppConfigured()) {
        console.warn(
          `[notifications] WhatsApp not configured — skipped ${eventType} for order ${order.orderNumber}. ` +
            "Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable it.",
        );
      }
      const result = await sendWhatsAppTemplate({
        phone: order.phone ?? "",
        templateName: whatsappTemplateName(eventType),
        languageCode: whatsappLanguageCode(),
        parameters: whatsappParameters(eventType, order),
      });
      await finish(slot.id!, result);
      outcome.whatsapp = result.status;
      if (result.status === "failed") {
        console.error("whatsapp_send_failed", {
          orderNumber: order.orderNumber,
          eventType,
          error: result.error,
        });
      }
    }
  } catch (error) {
    outcome.whatsapp = "failed";
    console.error("whatsapp_dispatch_failed", { orderId, eventType, error });
  }

  // --- Email ------------------------------------------------------------
  try {
    const slot = await claim(order.id, eventType, "EMAIL");
    if (!slot.claimed) {
      outcome.email = "deduplicated";
    } else {
      if (!isEmailConfigured()) {
        console.warn(
          `[notifications] Email not configured — skipped ${eventType} for order ${order.orderNumber}. ` +
            "Set EMAIL_PROVIDER_API_KEY and EMAIL_FROM to enable it.",
        );
      }
      const { html, text } = renderOrderEmail(eventType, order);
      const result = await sendEmail({
        to: order.email,
        subject: emailSubjects[eventType](order.orderNumber),
        html,
        text,
      });
      await finish(slot.id!, result);
      outcome.email = result.status;
      if (result.status === "failed") {
        console.error("email_send_failed", {
          orderNumber: order.orderNumber,
          eventType,
          error: result.error,
        });
      }
    }
  } catch (error) {
    outcome.email = "failed";
    console.error("email_dispatch_failed", { orderId, eventType, error });
  }

  return outcome;
}
