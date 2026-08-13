import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { contactEmail } from "@/data/contact";
import { FulfilmentStatusBadge, PaymentStatusBadge } from "@/components/OrderStatusBadge";

export const metadata: Metadata = {
  title: "Track Your Order",
  robots: { index: false, follow: false },
};

// Per-request: an order's status changes after the page was built.
export const dynamic = "force-dynamic";

/**
 * Guest-safe order tracking.
 *
 * Access is granted by the 32-byte accessToken in the URL, never by the order
 * number — which is short, quotable and partly sequential, so it must not be
 * sufficient on its own. Signed-in customers get the same information from
 * /account without needing the link.
 */
export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let order = null;
  try {
    // Tokens are 64 hex chars; reject anything else without a query.
    if (/^[a-f0-9]{64}$/.test(token)) {
      order = await prisma.order.findUnique({
        where: { accessToken: token },
        include: { items: true },
      });
    }
  } catch {
    return (
      <Shell heading="We can't load that order right now.">
        <p className="text-sm text-walnut/70">
          Please try again in a moment, or email us at {contactEmail}.
        </p>
      </Shell>
    );
  }

  if (!order) {
    return (
      <Shell heading="We couldn't find that order.">
        <p className="text-sm text-walnut/70">
          Check the link from your confirmation email, or email us at {contactEmail} and
          we&apos;ll help.
        </p>
      </Shell>
    );
  }

  const address = [
    order.shippingName,
    order.shippingLine1,
    order.shippingLine2,
    [order.shippingCity, order.shippingState].filter(Boolean).join(", "),
    order.shippingPostal,
    order.shippingCountry,
  ].filter(Boolean);

  return (
    <Shell heading={`Order ${order.orderNumber}`}>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <PaymentStatusBadge status={order.paymentStatus} />
        <FulfilmentStatusBadge status={order.fulfilmentStatus} paymentStatus={order.paymentStatus} />
      </div>

      <p className="mt-4 text-sm text-walnut/70">
        Placed{" "}
        {order.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {(order.courierName || order.trackingNumber) && (
        <div className="mt-8 rounded-2xl border border-gold/20 bg-white/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">Shipment</p>
          {order.courierName && (
            <p className="mt-2 text-sm text-ink">
              Courier: <span className="font-medium">{order.courierName}</span>
            </p>
          )}
          {order.trackingNumber && (
            <p className="mt-1 text-sm text-ink">
              Tracking number: <span className="font-medium">{order.trackingNumber}</span>
            </p>
          )}
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full bg-burgundy px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
            >
              Track with courier
            </a>
          )}
        </div>
      )}

      <h2 className="mt-10 font-display text-xl text-ink">Items</h2>
      <ul className="mt-3 divide-y divide-gold/15">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-4 py-3">
            <span className="text-sm text-ink">
              {item.name}
              <span className="text-walnut/70"> &times;{item.quantity}</span>
            </span>
            <span className="flex-shrink-0 text-sm text-ink">
              {formatPrice(item.lineTotal, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-1.5 text-sm">
        <Row label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
        {order.discount > 0 && (
          <Row label="Discount" value={`−${formatPrice(order.discount, order.currency)}`} />
        )}
        <Row
          label="Shipping"
          value={order.shipping > 0 ? formatPrice(order.shipping, order.currency) : "Calculated at checkout"}
        />
        <div className="flex items-center justify-between border-t border-gold/20 pt-2 text-base font-medium text-ink">
          <dt>Total</dt>
          <dd>{formatPrice(order.total, order.currency)}</dd>
        </div>
      </dl>

      {address.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-xl text-ink">Delivery address</h2>
          <p className="mt-2 text-sm leading-relaxed text-walnut/80">{address.join(", ")}</p>
        </>
      )}

      <p className="mt-10 text-sm text-walnut/70">
        Questions about this order? Email us at{" "}
        <a href={`mailto:${contactEmail}`} className="text-burgundy underline-offset-2 hover:underline">
          {contactEmail}
        </a>
        .
      </p>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-walnut/70">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function Shell({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
        Order Status
      </p>
      <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">{heading}</h1>
      {children}
      <Link
        href="/shop"
        className="mt-10 inline-block text-sm font-medium text-burgundy underline-offset-2 hover:underline"
      >
        Continue shopping →
      </Link>
    </div>
  );
}
