"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { placeOrder } from "@/lib/actions";

const FREE_SHIPPING_THRESHOLD_CENTS = 199900;
const FLAT_SHIPPING_CENTS = 9900;

export default function CheckoutPage() {
  const { items, subtotalCents, clear } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS || items.length === 0
      ? 0
      : FLAT_SHIPPING_CENTS;
  const totalCents = subtotalCents + shippingCents;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await placeOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerName: String(formData.get("customerName") ?? ""),
        customerEmail: String(formData.get("customerEmail") ?? ""),
        customerPhone: String(formData.get("customerPhone") ?? ""),
        shippingAddress: String(formData.get("shippingAddress") ?? ""),
        shippingCity: String(formData.get("shippingCity") ?? ""),
        shippingPostalCode: String(formData.get("shippingPostalCode") ?? ""),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      clear();
      router.push(`/order-confirmation/${result.orderNumber}`);
    });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Your cart is empty</h1>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream transition hover:bg-ink/85"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-10 font-display text-4xl text-ink">Checkout</h1>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <form action={handleSubmit} className="space-y-6">
          <div>
            <h2 className="mb-4 font-display text-xl text-ink">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="customerName" required />
              <Field label="Email" name="customerEmail" type="email" required />
              <Field label="Phone" name="customerPhone" type="tel" />
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-display text-xl text-ink">Shipping address</h2>
            <div className="grid gap-4">
              <Field label="Address" name="shippingAddress" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" name="shippingCity" required />
                <Field label="Postal code" name="shippingPostalCode" required />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-sage px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Placing order..." : `Place order · ${formatPrice(totalCents)}`}
          </button>
        </form>

        <div className="h-fit rounded-3xl border border-border bg-white/50 p-6">
          <h2 className="mb-4 font-display text-xl text-ink">Order summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-ink-soft">
                  {item.name} &times; {item.quantity}
                </span>
                <span className="text-ink">
                  {formatPrice(item.unitPriceCents * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Shipping</span>
              <span>{shippingCents === 0 ? "Free" : formatPrice(shippingCents)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">
        {label}
        {required && <span className="text-terracotta"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-ink outline-none transition focus:border-sage"
      />
    </label>
  );
}
