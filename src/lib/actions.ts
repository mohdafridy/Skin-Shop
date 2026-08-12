"use server";

import { createSupabaseClient } from "@/lib/supabase/client";

export type CheckoutInput = {
  items: { productId: string; quantity: number }[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
};

export type CheckoutResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

const FREE_SHIPPING_THRESHOLD_CENTS = 199900;
const FLAT_SHIPPING_CENTS = 9900;

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SK-${stamp}-${rand}`;
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (!input.customerName || !input.customerEmail || !input.shippingAddress) {
    return { ok: false, error: "Please fill in all required fields." };
  }

  const supabase = createSupabaseClient();

  const productIds = input.items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price_cents, in_stock")
    .in("id", productIds);

  if (productsError || !products || products.length === 0) {
    return { ok: false, error: "Could not verify products. Please try again." };
  }

  const orderItems = input.items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.in_stock) return null;
      return {
        product_id: product.id,
        product_name: product.name,
        unit_price_cents: product.price_cents,
        quantity: item.quantity,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (orderItems.length === 0) {
    return { ok: false, error: "None of the items in your cart are available." };
  }

  const subtotalCents = orderItems.reduce(
    (sum, i) => sum + i.unit_price_cents * i.quantity,
    0,
  );
  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  const totalCents = subtotalCents + shippingCents;
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone || null,
      shipping_address: input.shippingAddress,
      shipping_city: input.shippingCity,
      shipping_postal_code: input.shippingPostalCode,
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { ok: false, error: "Could not place your order. Please try again." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    return { ok: false, error: "Could not save order items. Please try again." };
  }

  return { ok: true, orderNumber };
}
