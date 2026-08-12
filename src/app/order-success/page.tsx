import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import OrderConfirmationView, { type ConfirmedOrder } from "@/components/checkout/OrderConfirmationView";
import ClearCartOnSuccess from "./ClearCartOnSuccess";

export const metadata: Metadata = { title: "Order Confirmed" };

function Pending({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center sm:px-8">
      <h1 className="font-display text-3xl text-ink">{heading}</h1>
      <p className="mt-3 text-sm text-walnut/70">{body}</p>
    </div>
  );
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id || !isStripeConfigured()) {
    return (
      <Pending
        heading="We couldn't find that order."
        body="If you completed a payment, check your email for confirmation, or contact us with your order details."
      />
    );
  }

  let order;
  try {
    order = await prisma.order.findUnique({ where: { stripeSessionId: session_id }, include: { items: true } });
  } catch {
    return (
      <Pending
        heading="We're confirming your order."
        body="This can take a moment. Refresh this page shortly, or check your email for confirmation."
      />
    );
  }

  if (!order) {
    return (
      <Pending
        heading="We couldn't find that order."
        body="If you completed a payment, check your email for confirmation, or contact us with your order details."
      />
    );
  }

  // The webhook is the authoritative fulfillment path (it decrements
  // stock), but it can land a few seconds after Stripe redirects the
  // customer back here. Verifying the session directly with Stripe (using
  // our secret key, never trusting anything from the URL alone) lets us
  // show a real confirmation immediately without waiting on the webhook —
  // this is never a fabricated success, only ever a Stripe-confirmed one.
  let paid = order.status === "PAID";
  if (!paid) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      paid = session.payment_status === "paid" && session.metadata?.orderId === order.id;
    } catch {
      paid = false;
    }
  }

  if (!paid) {
    return (
      <Pending
        heading="We're confirming your payment."
        body="This can take a moment. Refresh this page shortly, or check your email for confirmation."
      />
    );
  }

  const confirmed: ConfirmedOrder = {
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

  return (
    <>
      {order.source === "cart" && <ClearCartOnSuccess />}
      <OrderConfirmationView order={confirmed} />
    </>
  );
}
