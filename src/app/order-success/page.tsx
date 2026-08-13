import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { track } from "@/lib/analytics";
import OrderConfirmationView, { type ConfirmedOrder } from "@/components/checkout/OrderConfirmationView";
import ClearCartOnSuccess from "./ClearCartOnSuccess";

export const metadata: Metadata = { title: "Order Confirmed" };

// Per-request: payment confirmation must never come from a cached render.
export const dynamic = "force-dynamic";

function Pending({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center sm:px-8">
      <h1 className="font-display text-3xl text-ink">{heading}</h1>
      <p className="mt-3 text-sm text-walnut/70">{body}</p>
    </div>
  );
}

const notFound = (
  <Pending
    heading="We couldn't find that order."
    body="If you completed a payment, check your email for confirmation, or contact us with your order details."
  />
);

const confirming = (
  <Pending
    heading="We're confirming your payment."
    body="This can take a moment. Refresh this page shortly, or check your email for confirmation."
  />
);

function toConfirmedOrder(order: {
  orderNumber: string;
  customerName: string | null;
  email: string;
  currency: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostal: string | null;
  shippingCountry: string | null;
  items: { type: string; slug: string | null; id: string; name: string; image: string | null; unitPrice: number; quantity: number }[];
}): ConfirmedOrder {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName ?? "",
    customerEmail: order.email,
    lines: order.items.map((item) => ({
      type: item.type === "COMBO" ? "combo" : "product",
      slug: item.slug ?? item.id,
      name: item.name,
      image: item.image ?? "",
      price: item.unitPrice,
      currency: order.currency,
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    currency: order.currency,
    deliveryAddress: [
      order.shippingLine1,
      order.shippingLine2,
      order.shippingCity,
      order.shippingState,
      order.shippingPostal,
      order.shippingCountry,
    ]
      .filter(Boolean)
      .join(", "),
    deliveryMethodLabel: "Standard Delivery",
  };
}

/**
 * Two gateways redirect here with two different tokens:
 *  - Razorpay: `?order=<accessToken>`. /api/payments/razorpay/verify already
 *    checked the HMAC signature and persisted paymentStatus before issuing
 *    this redirect, so the stored status is read as-is — never re-derived
 *    from anything in the URL.
 *  - Stripe: `?session_id=<id>` (kept only while Stripe is still an
 *    available provider). Verified live against Stripe here because the
 *    webhook confirming it can arrive a few seconds after the redirect.
 *
 * Either way, the persisted order is the source of truth for what the
 * customer sees — the URL only says which order to look up.
 */
export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order?: string }>;
}) {
  const { session_id, order: accessToken } = await searchParams;

  if (accessToken) {
    if (!/^[a-f0-9]{64}$/.test(accessToken)) return notFound;

    let order;
    try {
      order = await prisma.order.findUnique({ where: { accessToken }, include: { items: true } });
    } catch {
      return confirming;
    }
    if (!order) return notFound;
    if (order.paymentStatus !== "PAID") return confirming;

    track({ name: "purchase", orderNumber: order.orderNumber, total: order.total, currency: order.currency });

    return (
      <>
        {order.source === "cart" && <ClearCartOnSuccess />}
        <OrderConfirmationView order={toConfirmedOrder(order)} />
      </>
    );
  }

  if (!session_id || !isStripeConfigured()) return notFound;

  let order;
  try {
    order = await prisma.order.findUnique({ where: { stripeSessionId: session_id }, include: { items: true } });
  } catch {
    return confirming;
  }
  if (!order) return notFound;

  // The webhook is the authoritative fulfillment path (it decrements
  // stock), but it can land a few seconds after Stripe redirects the
  // customer back here. Verifying the session directly with Stripe (using
  // our secret key, never trusting anything from the URL alone) lets us
  // show a real confirmation immediately without waiting on the webhook —
  // this is never a fabricated success, only ever a Stripe-confirmed one.
  let paid = order.paymentStatus === "PAID";
  if (!paid) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      paid = session.payment_status === "paid" && session.metadata?.orderId === order.id;
    } catch {
      paid = false;
    }
  }
  if (!paid) return confirming;

  track({ name: "purchase", orderNumber: order.orderNumber, total: order.total, currency: order.currency });

  return (
    <>
      {order.source === "cart" && <ClearCartOnSuccess />}
      <OrderConfirmationView order={toConfirmedOrder(order)} />
    </>
  );
}
