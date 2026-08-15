import { formatPrice } from "@/lib/format";
import { contactEmail, contactPhoneDisplay } from "@/data/contact";
import { siteUrl, storeName, type NotifiableEvent } from "./templates";
import type { OrderForNotification } from "./types";

/**
 * Transactional email bodies. Table-based and inline-styled because that is
 * what mail clients reliably render — Tailwind classes and modern CSS do not
 * survive Gmail/Outlook. Colours mirror the site's tokens so the emails read
 * as the same brand.
 */

const INK = "#201d1a";
const WALNUT = "#4a3b32";
const IVORY = "#faf5ef";
const BURGUNDY = "#7d2a3f";
const GOLD = "#c9a44c";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function addressLines(order: OrderForNotification): string[] {
  return [
    order.shippingName,
    order.shippingLine1,
    order.shippingLine2,
    [order.shippingCity, order.shippingState].filter(Boolean).join(", "),
    order.shippingPostal,
    order.shippingCountry,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

function paymentStatusLabel(order: OrderForNotification): string {
  switch (order.paymentStatus) {
    case "PAID":
      return "Paid";
    case "PENDING":
      return "Awaiting payment";
    case "FAILED":
      return "Payment failed";
    case "REFUND_PENDING":
      return "Refund in progress";
    case "REFUNDED":
      return "Refunded";
  }
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:999px;background:${BURGUNDY};">
<a href="${href}" style="display:inline-block;padding:13px 28px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:${IVORY};text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

function itemsTable(order: OrderForNotification): string {
  const rows = order.items
    .map(
      (item) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid #e8ded1;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${INK};">
${escapeHtml(item.name)}<span style="color:${WALNUT};"> &times; ${item.quantity}</span>
</td>
<td align="right" style="padding:10px 0;border-bottom:1px solid #e8ded1;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${INK};white-space:nowrap;">
${escapeHtml(formatPrice(item.lineTotal, order.currency))}
</td>
</tr>`,
    )
    .join("");

  const summaryRow = (label: string, value: string, bold = false) => `<tr>
<td style="padding:5px 0;font-family:Helvetica,Arial,sans-serif;font-size:${bold ? "15px" : "14px"};color:${bold ? INK : WALNUT};${bold ? "font-weight:700;padding-top:12px;" : ""}">${escapeHtml(label)}</td>
<td align="right" style="padding:5px 0;font-family:Helvetica,Arial,sans-serif;font-size:${bold ? "15px" : "14px"};color:${bold ? INK : WALNUT};${bold ? "font-weight:700;padding-top:12px;" : ""}white-space:nowrap;">${escapeHtml(value)}</td>
</tr>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">${rows}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
${summaryRow("Subtotal", formatPrice(order.subtotal, order.currency))}
${order.discount > 0 ? summaryRow("Discount", `-${formatPrice(order.discount, order.currency)}`) : ""}
${summaryRow("Shipping", order.shipping > 0 ? formatPrice(order.shipping, order.currency) : "Calculated at checkout")}
${order.tax > 0 ? summaryRow("Tax", formatPrice(order.tax, order.currency)) : ""}
${summaryRow("Total", formatPrice(order.total, order.currency), true)}
</table>`;
}

function shell(order: OrderForNotification, heading: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#f2ece4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2ece4;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${IVORY};border-radius:14px;overflow:hidden;">
<tr><td style="padding:26px 28px 0;">
<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:21px;color:${INK};">${escapeHtml(storeName)}</p>
<p style="margin:5px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${GOLD};">Rooted in Kashmir. Made for Your Ritual.</p>
</td></tr>
<tr><td style="padding:22px 28px 30px;">
<h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:25px;line-height:1.25;font-weight:normal;color:${INK};">${escapeHtml(heading)}</h1>
${bodyHtml}
</td></tr>
<tr><td style="padding:20px 28px 26px;background:${WALNUT};">
<p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#e5d9c9;">Questions about order ${escapeHtml(order.orderNumber)}? Reply to this email or reach us at:</p>
<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#e5d9c9;">${escapeHtml(contactEmail)} &nbsp;&middot;&nbsp; ${escapeHtml(contactPhoneDisplay)}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:${WALNUT};">${text}</p>`;
}

function detailBlock(title: string, lines: string[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;background:#fffdfa;border:1px solid #eadfd0;border-radius:10px;">
<tr><td style="padding:14px 16px;">
<p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:${GOLD};font-weight:700;">${escapeHtml(title)}</p>
${lines.map((l) => `<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${INK};">${l}</p>`).join("")}
</td></tr></table>`;
}

function trackingBlock(order: OrderForNotification): string {
  if (!order.courierName && !order.trackingNumber) return "";
  const lines: string[] = [];
  if (order.courierName) lines.push(`Courier: ${escapeHtml(order.courierName)}`);
  if (order.trackingNumber) lines.push(`Tracking number: ${escapeHtml(order.trackingNumber)}`);
  return detailBlock("Shipment", lines);
}

/** Public tracking link — the token is what authorises access, never the
 * order number on its own. */
function trackUrl(order: OrderForNotification): string {
  return `${siteUrl()}/track/${order.accessToken}`;
}

/** Deep-links into the existing per-product/combo reviews section — the
 * anchor ids (`reviews-${slug}`) already exist from ReviewsSection. Items
 * without a slug (older orders, predating slug capture) are simply skipped. */
function reviewUrl(item: { slug: string | null; type: "PRODUCT" | "COMBO" }): string | null {
  if (!item.slug) return null;
  return item.type === "COMBO"
    ? `${siteUrl()}/rituals#reviews-${item.slug}`
    : `${siteUrl()}/products/${item.slug}#reviews-${item.slug}`;
}

export type RenderedEmail = { html: string; text: string };

export function renderOrderEmail(event: NotifiableEvent, order: OrderForNotification): RenderedEmail {
  const name = order.customerName?.trim() || "there";
  const greeting = paragraph(`Hi ${escapeHtml(name)},`);
  const track = trackUrl(order);

  switch (event) {
    case "PAYMENT_SUCCESSFUL": {
      const html = shell(
        order,
        `Order ${order.orderNumber} is confirmed`,
        greeting +
          paragraph("Thank you — your payment went through and we've started preparing your ritual.") +
          itemsTable(order) +
          detailBlock("Delivery address", addressLines(order).map(escapeHtml)) +
          detailBlock("Payment", [`${escapeHtml(paymentStatusLabel(order))}${order.paymentMethod ? ` &middot; ${escapeHtml(order.paymentMethod)}` : ""}`]) +
          paragraph("We'll message you as soon as it ships.") +
          button(track, "Track your order"),
      );
      const text = [
        `Hi ${name},`,
        "",
        `Your order ${order.orderNumber} is confirmed and payment was successful.`,
        "",
        ...order.items.map((i) => `- ${i.name} x${i.quantity} — ${formatPrice(i.lineTotal, order.currency)}`),
        "",
        `Subtotal: ${formatPrice(order.subtotal, order.currency)}`,
        ...(order.discount > 0 ? [`Discount: -${formatPrice(order.discount, order.currency)}`] : []),
        `Total: ${formatPrice(order.total, order.currency)}`,
        "",
        `Delivery to: ${addressLines(order).join(", ")}`,
        `Payment: ${paymentStatusLabel(order)}`,
        "",
        `Track your order: ${track}`,
      ].join("\n");
      return { html, text };
    }

    case "PAYMENT_FAILED": {
      const html = shell(
        order,
        "Your payment couldn't be completed",
        greeting +
          paragraph(
            `The payment for order <strong>${escapeHtml(order.orderNumber)}</strong> didn't go through, so we haven't started it. Nothing has been charged.`,
          ) +
          paragraph("You can try again whenever you're ready — your items are still available.") +
          button(`${siteUrl()}/checkout`, "Try payment again"),
      );
      const text = [
        `Hi ${name},`,
        "",
        `The payment for order ${order.orderNumber} didn't go through and nothing was charged.`,
        `You can try again here: ${siteUrl()}/checkout`,
      ].join("\n");
      return { html, text };
    }

    case "SHIPPED": {
      const html = shell(
        order,
        `Order ${order.orderNumber} has shipped`,
        greeting +
          paragraph("Your order is on its way.") +
          trackingBlock(order) +
          (order.trackingUrl ? button(order.trackingUrl, "Track with courier") : button(track, "View your order")),
      );
      const text = [
        `Hi ${name},`,
        "",
        `Order ${order.orderNumber} has shipped.`,
        ...(order.courierName ? [`Courier: ${order.courierName}`] : []),
        ...(order.trackingNumber ? [`Tracking number: ${order.trackingNumber}`] : []),
        ...(order.trackingUrl ? [`Track: ${order.trackingUrl}`] : [`View your order: ${track}`]),
      ].join("\n");
      return { html, text };
    }

    case "OUT_FOR_DELIVERY": {
      const html = shell(
        order,
        "Out for delivery today",
        greeting +
          paragraph(`Order <strong>${escapeHtml(order.orderNumber)}</strong> is out for delivery and should reach you today.`) +
          trackingBlock(order) +
          (order.trackingUrl ? button(order.trackingUrl, "Track with courier") : ""),
      );
      const text = [
        `Hi ${name},`,
        "",
        `Order ${order.orderNumber} is out for delivery and should reach you today.`,
        ...(order.trackingUrl ? [`Track: ${order.trackingUrl}`] : []),
      ].join("\n");
      return { html, text };
    }

    case "DELIVERED": {
      const html = shell(
        order,
        "Delivered",
        greeting +
          paragraph(`Order <strong>${escapeHtml(order.orderNumber)}</strong> has been delivered. We hope you love it.`) +
          paragraph("If anything isn't right, reply to this email and we'll sort it out.") +
          button(`${siteUrl()}/shop`, "Shop again"),
      );
      const text = [
        `Hi ${name},`,
        "",
        `Order ${order.orderNumber} has been delivered. If anything isn't right, just reply to this email.`,
      ].join("\n");
      return { html, text };
    }

    case "CANCELLED": {
      const html = shell(
        order,
        `Order ${order.orderNumber} has been cancelled`,
        greeting +
          paragraph("This order has been cancelled. If you were charged, the refund follows separately and we'll email you when it's done.") +
          button(`${siteUrl()}/shop`, "Browse the collection"),
      );
      const text = [
        `Hi ${name},`,
        "",
        `Order ${order.orderNumber} has been cancelled. If you were charged, we'll email you when the refund completes.`,
      ].join("\n");
      return { html, text };
    }

    case "REFUND_INITIATED": {
      const html = shell(
        order,
        "Your refund is on its way",
        greeting +
          paragraph(
            `We've initiated a refund of <strong>${escapeHtml(formatPrice(order.total, order.currency))}</strong> for order <strong>${escapeHtml(order.orderNumber)}</strong>.`,
          ) +
          paragraph("Banks usually take 5–7 working days to post it. We'll confirm once it's complete."),
      );
      const text = [
        `Hi ${name},`,
        "",
        `A refund of ${formatPrice(order.total, order.currency)} has been initiated for order ${order.orderNumber}.`,
        "Banks usually take 5-7 working days to post it.",
      ].join("\n");
      return { html, text };
    }

    case "REFUNDED": {
      const html = shell(
        order,
        "Refund completed",
        greeting +
          paragraph(
            `Your refund of <strong>${escapeHtml(formatPrice(order.total, order.currency))}</strong> for order <strong>${escapeHtml(order.orderNumber)}</strong> has been completed.`,
          ) +
          paragraph("It may take a day or two more to appear on your statement, depending on your bank."),
      );
      const text = [
        `Hi ${name},`,
        "",
        `Your refund of ${formatPrice(order.total, order.currency)} for order ${order.orderNumber} is complete.`,
      ].join("\n");
      return { html, text };
    }

    case "REVIEW_REQUESTED": {
      const reviewLinks = order.items
        .map((item) => ({ item, url: reviewUrl(item) }))
        .filter((entry): entry is { item: (typeof order.items)[number]; url: string } => entry.url !== null);

      const linksHtml = reviewLinks.length
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 8px;">${reviewLinks
            .map(
              ({ item, url }) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e8ded1;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${INK};">
${escapeHtml(item.name)}
</td><td align="right" style="padding:8px 0;border-bottom:1px solid #e8ded1;">
<a href="${url}" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${BURGUNDY};text-decoration:underline;">Write a review</a>
</td></tr>`,
            )
            .join("")}</table>`
        : button(track, "Write a review");

      const html = shell(
        order,
        "How was your order?",
        greeting +
          paragraph(
            `It's been a little while since order <strong>${escapeHtml(order.orderNumber)}</strong> was delivered — we'd love to know what you thought.`,
          ) +
          linksHtml +
          paragraph("Real reviews from real customers are what help other people trust us. Thank you for taking a moment."),
      );
      const text = [
        `Hi ${name},`,
        "",
        `It's been a little while since order ${order.orderNumber} was delivered — we'd love to know what you thought.`,
        "",
        ...(reviewLinks.length
          ? reviewLinks.map(({ item, url }) => `${item.name}: ${url}`)
          : [`Leave a review: ${track}`]),
      ].join("\n");
      return { html, text };
    }
  }
}
