import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
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
 * Razorpay redirects here as `?order=<accessToken>`.
 * /api/payments/razorpay/verify already checked the HMAC signature and
 * persisted paymentStatus before issuing that redirect, so the stored status
 * is read as-is — this page never re-derives payment state from the URL,
 * and never fabricates a success.
 */
export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: accessToken } = await searchParams;

  if (!accessToken || !/^[a-f0-9]{64}$/.test(accessToken)) return notFound;

  let order;
  try {
    order = await prisma.order.findUnique({ where: { accessToken }, include: { items: true } });
  } catch {
    return confirming;
  }
  if (!order) return notFound;
  if (order.paymentStatus !== "PAID") return confirming;

  // Fires only here, after the order was confirmed paid — never on page
  // load, never speculatively.
  track({ name: "purchase", orderNumber: order.orderNumber, total: order.total, currency: order.currency });

  return (
    <>
      {order.source === "cart" && <ClearCartOnSuccess />}
      <OrderConfirmationView order={toConfirmedOrder(order)} />
    </>
  );
}
