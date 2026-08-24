import { formatPrice } from "@/lib/format";
import { contactEmail } from "@/data/contact";
import { sendEmail } from "./email";
import { siteUrl, storeName } from "./templates";

type UpiOrderAlert = {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
  customerName: string | null;
  email: string;
  phone: string | null;
  itemCount: number;
};

/** Address that receives internal order alerts. Defaults to the business
 * inbox; set OWNER_ALERT_EMAIL to route these elsewhere. */
function ownerAlertEmail(): string {
  return (process.env.OWNER_ALERT_EMAIL || contactEmail).trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Emails the store owner the moment a direct-UPI order is placed, so they know
 * to check their bank and confirm it. A direct-UPI order has no gateway
 * webhook, so this is the owner's only automatic heads-up.
 *
 * Fire-and-forget: never throws, so a mail hiccup can't fail order creation.
 * If email isn't configured the underlying sender returns "skipped" and this
 * simply logs — no alert is lost loudly.
 */
export async function sendOwnerUpiOrderAlert(order: UpiOrderAlert): Promise<void> {
  try {
    const amount = formatPrice(order.total, order.currency);
    const adminUrl = `${siteUrl()}/admin/orders/${order.id}`;
    const subject = `New UPI order ${order.orderNumber} — ${amount} (verify payment)`;

    const text = [
      "A direct-UPI order was just placed.",
      "",
      `Order:    ${order.orderNumber}`,
      `Amount:   ${amount}`,
      `Customer: ${order.customerName || "—"}`,
      `Email:    ${order.email}`,
      `Phone:    ${order.phone || "—"}`,
      `Items:    ${order.itemCount}`,
      "",
      `Check your UPI/bank app for a payment of exactly ${amount}, then mark the order Paid in admin. Don't dispatch until you've confirmed the money arrived.`,
      "",
      adminUrl,
    ].join("\n");

    const html = `<!doctype html><html><body style="margin:0;background:#f5efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#2a201c;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e6d9c2;border-radius:16px;padding:28px;">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7d2a3f;font-weight:bold;">${escapeHtml(storeName)} · New UPI order</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#2a201c;">${escapeHtml(amount)} — verify payment</h1>
    <p style="margin:0 0 16px;font-size:14px;color:#5b4b42;">A customer chose <strong>direct UPI</strong>. This won't appear in Razorpay — check your bank/UPI app for a payment of exactly ${escapeHtml(amount)}.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#2a201c;">
      <tr><td style="padding:4px 0;color:#8a7a6f;">Order</td><td style="padding:4px 0;text-align:right;font-weight:bold;">${escapeHtml(order.orderNumber)}</td></tr>
      <tr><td style="padding:4px 0;color:#8a7a6f;">Amount</td><td style="padding:4px 0;text-align:right;font-weight:bold;">${escapeHtml(amount)}</td></tr>
      <tr><td style="padding:4px 0;color:#8a7a6f;">Customer</td><td style="padding:4px 0;text-align:right;">${escapeHtml(order.customerName || "—")}</td></tr>
      <tr><td style="padding:4px 0;color:#8a7a6f;">Phone</td><td style="padding:4px 0;text-align:right;">${escapeHtml(order.phone || "—")}</td></tr>
      <tr><td style="padding:4px 0;color:#8a7a6f;">Email</td><td style="padding:4px 0;text-align:right;">${escapeHtml(order.email)}</td></tr>
      <tr><td style="padding:4px 0;color:#8a7a6f;">Items</td><td style="padding:4px 0;text-align:right;">${order.itemCount}</td></tr>
    </table>
    <p style="margin:20px 0 0;">
      <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#7d2a3f;color:#fdf9f2;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:bold;">Open order in admin</a>
    </p>
    <p style="margin:18px 0 0;font-size:12px;color:#8a7a6f;">Once you've confirmed the money arrived, mark the order <strong>Paid</strong>. Don't dispatch before that.</p>
  </div>
</body></html>`;

    const result = await sendEmail({ to: ownerAlertEmail(), subject, html, text });
    if (result.status !== "sent") {
      console.warn("owner_upi_alert_not_sent", { orderNumber: order.orderNumber, result });
    }
  } catch (error) {
    console.error("owner_upi_alert_failed", { orderNumber: order.orderNumber, error });
  }
}
