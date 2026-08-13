import type { Metadata } from "next";
import Link from "next/link";
import { notFound as nextNotFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { StatusPill, paymentLabels, fulfilmentLabels } from "@/components/OrderStatusBadge";
import AdminHeader from "../../AdminHeader";
import OrderActions from "./OrderActions";

export const metadata: Metadata = { title: "Order", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const eventLabels: Record<string, string> = {
  ORDER_CREATED: "Order created",
  PAYMENT_PENDING: "Payment pending",
  PAYMENT_SUCCESSFUL: "Payment successful",
  PAYMENT_FAILED: "Payment failed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUND_INITIATED: "Refund initiated",
  REFUNDED: "Refunded",
};

const notificationStatusTone: Record<string, "positive" | "pending" | "problem" | "neutral"> = {
  SENT: "positive",
  PENDING: "pending",
  FAILED: "problem",
  SKIPPED: "neutral",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" }, take: 30 },
      notifications: { orderBy: { createdAt: "desc" } },
      coupon: { select: { code: true } },
    },
  });

  if (!order) nextNotFound();

  const address = [
    order.shippingLine1,
    order.shippingLine2,
    [order.shippingCity, order.shippingState].filter(Boolean).join(", "),
    order.shippingPostal,
    order.shippingCountry,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <AdminHeader title={`Order ${order.orderNumber}`} />
      <Link href="/admin" className="mb-6 inline-block text-sm text-walnut/70 underline-offset-2 hover:text-burgundy hover:underline">
        ← All orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusPill {...paymentLabels[order.paymentStatus]} />
        <StatusPill {...fulfilmentLabels[order.fulfilmentStatus]} />
        <span className="text-sm text-walnut/60">
          Placed{" "}
          {order.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          <OrderActions
            orderId={order.id}
            fulfilmentStatus={order.fulfilmentStatus}
            paymentStatus={order.paymentStatus}
            courierName={order.courierName}
            trackingNumber={order.trackingNumber}
            trackingUrl={order.trackingUrl}
            notes={order.notes}
            razorpayConfigured={isRazorpayConfigured()}
            orderTotal={order.total}
          />

          <section className="rounded-2xl border border-gold/20 bg-white/50 p-6">
            <h2 className="font-display text-xl text-ink">History</h2>
            {order.events.length === 0 ? (
              <p className="mt-2 text-sm text-walnut/70">No events recorded yet.</p>
            ) : (
              <ul className="mt-4 space-y-3 border-l border-gold/25 pl-4">
                {order.events.map((event) => (
                  <li key={event.id} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-gold" />
                    <p className="font-medium text-ink">{eventLabels[event.type] ?? event.type}</p>
                    <p className="text-xs text-walnut/60">
                      {event.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-gold/20 bg-white/50 p-6">
            <h2 className="font-display text-xl text-ink">Notifications</h2>
            {order.notifications.length === 0 ? (
              <p className="mt-2 text-sm text-walnut/70">Nothing sent for this order yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gold/15">
                {order.notifications.map((n) => (
                  <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                    <div>
                      <p className="text-ink">
                        {n.channel === "WHATSAPP" ? "WhatsApp" : "Email"} — {eventLabels[n.eventType] ?? n.eventType}
                      </p>
                      {n.error && <p className="mt-0.5 text-xs text-burgundy">{n.error}</p>}
                    </div>
                    <StatusPill label={n.status} tone={notificationStatusTone[n.status] ?? "neutral"} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-gold/20 bg-white/50 p-6">
            <h2 className="font-display text-xl text-ink">Customer</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row label="Name" value={order.customerName || "—"} />
              <Row label="Email" value={order.email} />
              <Row label="Phone" value={order.phone || "—"} />
              <Row label="Checkout" value={order.source === "buy_now" ? "Buy Now" : "Cart"} />
            </dl>
          </section>

          <section className="rounded-2xl border border-gold/20 bg-white/50 p-6">
            <h2 className="font-display text-xl text-ink">Delivery address</h2>
            {address.length > 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-walnut/80">{address.join(", ")}</p>
            ) : (
              <p className="mt-2 text-sm text-walnut/70">Not provided.</p>
            )}
          </section>

          <section className="rounded-2xl border border-gold/20 bg-white/50 p-6">
            <h2 className="font-display text-xl text-ink">Payment</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row label="Provider" value={order.paymentProvider ?? "—"} />
              <Row label="Method" value={order.paymentMethod ?? "—"} />
              <Row label="Razorpay order" value={order.razorpayOrderId ?? "—"} mono />
              <Row label="Razorpay payment" value={order.razorpayPaymentId ?? "—"} mono />
              {order.razorpayRefundId && <Row label="Razorpay refund" value={order.razorpayRefundId} mono />}
              {order.coupon && <Row label="Coupon" value={order.coupon.code} />}
            </dl>
          </section>

          <section className="rounded-2xl border border-gold/20 bg-white/50 p-6">
            <h2 className="font-display text-xl text-ink">Items</h2>
            <ul className="mt-3 divide-y divide-gold/15">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                  <span className="text-ink">
                    {item.name}
                    <span className="text-walnut/60"> ×{item.quantity}</span>
                  </span>
                  <span className="flex-shrink-0 text-ink">{formatPrice(item.lineTotal, order.currency)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-gold/20 pt-3 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
              {order.discount > 0 && <Row label="Discount" value={`−${formatPrice(order.discount, order.currency)}`} />}
              <Row label="Shipping" value={formatPrice(order.shipping, order.currency)} />
              {order.tax > 0 && <Row label="Tax" value={formatPrice(order.tax, order.currency)} />}
              <div className="flex items-center justify-between border-t border-gold/20 pt-2 font-medium text-ink">
                <dt>Total</dt>
                <dd>{formatPrice(order.total, order.currency)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-walnut/70">{label}</dt>
      <dd className={`text-right text-ink ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
