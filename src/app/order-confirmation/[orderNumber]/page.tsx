import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = createSupabaseClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-3xl text-sage-dark">
        ✓
      </div>
      <h1 className="font-display text-4xl text-ink">Thank you, {order.customer_name.split(" ")[0]}!</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Your order has been placed. A confirmation has been sent to{" "}
        <span className="text-ink">{order.customer_email}</span>.
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        Order number: <span className="font-medium text-ink">{order.order_number}</span>
      </p>

      <div className="mt-10 rounded-3xl border border-border bg-white/50 p-6 text-left">
        <div className="space-y-3">
          {items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-ink-soft">
                {item.product_name} &times; {item.quantity}
              </span>
              <span className="text-ink">
                {formatPrice(item.unit_price_cents * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Shipping</span>
            <span>{order.shipping_cents === 0 ? "Free" : formatPrice(order.shipping_cents)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.total_cents)}</span>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-5 text-sm text-ink-soft">
          <p className="font-medium text-ink">Shipping to</p>
          <p className="mt-1">{order.shipping_address}</p>
          <p>
            {order.shipping_city}, {order.shipping_postal_code}
          </p>
        </div>
      </div>

      <Link
        href="/shop"
        className="mt-10 inline-block rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream transition hover:bg-ink/85"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
