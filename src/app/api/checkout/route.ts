import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured, toStripeAmount } from "@/lib/stripe";
import { calculateDiscount, checkoutSchema, couponIsUsable, createOrderNumber } from "@/lib/backend";

export async function POST(request: Request) {
  // Check payment configuration before touching the database at all, so
  // checkout degrades to the same honest "not connected yet" response
  // whether or not a database is even reachable yet.
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "No payment gateway is connected yet. Add a Stripe integration to accept payment.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request", message: "Malformed request body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid checkout request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { lines, couponCode, shipping, source } = parsed.data;

    const productSlugs = lines.filter((l) => l.type === "product").map((l) => l.slug);
    const comboSlugs = lines.filter((l) => l.type === "combo").map((l) => l.slug);

    const [products, combos] = await Promise.all([
      productSlugs.length
        ? prisma.product.findMany({ where: { slug: { in: productSlugs }, active: true } })
        : Promise.resolve([]),
      comboSlugs.length
        ? prisma.combo.findMany({ where: { slug: { in: comboSlugs }, active: true } })
        : Promise.resolve([]),
    ]);

    const productBySlug = new Map(products.map((p) => [p.slug, p]));
    const comboBySlug = new Map(combos.map((c) => [c.slug, c]));

    let subtotal = 0;
    const orderItems = lines.map((line) => {
      if (line.type === "product") {
        const p = productBySlug.get(line.slug);
        if (!p) throw new Error(`"${line.slug}" is no longer available.`);
        if (p.stock !== null && line.quantity > p.stock) {
          throw new Error(`Only ${p.stock} of ${p.name} left in stock.`);
        }
        const lineTotal = p.price * line.quantity;
        subtotal += lineTotal;
        return {
          type: "PRODUCT" as const,
          slug: p.slug,
          productId: p.id,
          name: p.name,
          image: p.image,
          unitPrice: p.price,
          quantity: line.quantity,
          lineTotal,
        };
      }
      const c = comboBySlug.get(line.slug);
      if (!c) throw new Error(`"${line.slug}" is no longer available.`);
      if (c.stock !== null && line.quantity > c.stock) {
        throw new Error(`Only ${c.stock} of ${c.name} left in stock.`);
      }
      const lineTotal = c.price * line.quantity;
      subtotal += lineTotal;
      return {
        type: "COMBO" as const,
        slug: c.slug,
        comboId: c.id,
        name: c.name,
        image: c.image,
        unitPrice: c.price,
        quantity: line.quantity,
        lineTotal,
      };
    });

    let coupon = null;
    let discount = 0;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
      if (coupon && couponIsUsable(coupon, subtotal)) discount = calculateDiscount(coupon, subtotal);
      else coupon = null;
    }

    // Shipping and tax are not configured anywhere on the site yet (see
    // src/data/shipping.ts and src/data/tax.ts) — kept at 0 here rather
    // than invented, consistent with the rest of the checkout flow.
    const shippingCost = 0;
    const tax = 0;
    const currency = (process.env.STORE_CURRENCY || "INR").toUpperCase();
    const total = Math.max(0, subtotal - discount + shippingCost + tax);

    const order = await prisma.order.create({
      data: {
        orderNumber: createOrderNumber(),
        email: shipping.email,
        customerName: shipping.name,
        phone: shipping.phone,
        source,
        status: "PENDING",
        subtotal,
        discount,
        shipping: shippingCost,
        tax,
        total,
        currency,
        couponId: coupon?.id,
        shippingName: shipping.name,
        shippingLine1: shipping.address1,
        shippingLine2: shipping.address2 || null,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPostal: shipping.postalCode,
        shippingCountry: shipping.country,
        items: { create: orderItems },
      },
    });

    const stripe = getStripe();
    const stripeCurrency = currency.toLowerCase();

    let discounts: { coupon: string }[] | undefined;
    if (discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: toStripeAmount(discount),
        currency: stripeCurrency,
        duration: "once",
        name: coupon?.code ?? "Discount",
        metadata: { orderId: order.id },
      });
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

    // Our own checkout form already collected shipping/billing address and
    // email, so we don't ask Stripe's hosted page to collect them again —
    // it only needs to handle the payment method itself.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: shipping.email,
      line_items: orderItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: stripeCurrency,
          unit_amount: toStripeAmount(item.unitPrice),
          product_data: {
            name: item.name,
            ...(item.image?.startsWith("http") ? { images: [item.image] } : {}),
          },
        },
      })),
      ...(discounts ? { discounts } : {}),
      success_url: `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

    return NextResponse.json({ checkoutUrl: session.url, orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    return NextResponse.json({ error: "checkout_failed", message }, { status: 500 });
  }
}
