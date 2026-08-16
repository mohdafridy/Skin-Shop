import type { OrderLine } from "./OrderSummary";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/data/contact";
import { WhatsAppIcon } from "@/components/icons";

/**
 * Presentational only — not wired to a route yet. There is currently no
 * way to reach this honestly: no payment provider is connected and COD
 * isn't configured, so no order can actually be created (see
 * src/lib/payment). Render this once a real order-creation response
 * (a verified payment webhook, or a configured COD flow) exists, passing
 * it the real order it returned — never synthetic/preview data.
 */
export type ConfirmedOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  deliveryAddress: string;
  deliveryMethodLabel: string;
};

export default function OrderConfirmationView({ order }: { order: ConfirmedOrder }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:px-8">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-olive/15 text-3xl text-olive">
        ✓
      </div>
      <h1 className="font-display text-4xl text-ink">Your ritual is on its way.</h1>
      <p className="mt-3 text-sm text-walnut/70">
        A confirmation has been sent to <span className="text-ink">{order.customerEmail}</span>.
      </p>
      <p className="mt-1 text-sm text-walnut/70">
        Order number: <span className="font-medium text-ink">{order.orderNumber}</span>
      </p>

      <div className="mt-10 rounded-md border border-gold/20 bg-white/50 p-6 text-left">
        <div className="space-y-3">
          {order.lines.map((line) => (
            <div key={`${line.type}:${line.slug}`} className="flex justify-between text-sm">
              <span className="text-walnut/70">
                {line.name} × {line.quantity}
              </span>
              <span className="text-ink">{formatPrice(line.price * line.quantity, line.currency)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t border-gold/20 pt-5 text-sm">
          <div className="flex justify-between text-walnut/70">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal, order.currency)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-olive">
              <span>Discount</span>
              <span>&minus;{formatPrice(order.discount, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-walnut/70">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping, order.currency)}</span>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between text-walnut/70">
              <span>Tax</span>
              <span>{formatPrice(order.tax, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gold/20 pt-2 font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.total, order.currency)}</span>
          </div>
        </div>
        <div className="mt-6 border-t border-gold/20 pt-5 text-sm text-walnut/70">
          <p className="font-medium text-ink">Delivery to</p>
          <p className="mt-1">{order.deliveryAddress}</p>
          <p className="mt-1">{order.deliveryMethodLabel}</p>
        </div>
      </div>

      <p className="mt-8 text-sm text-walnut/70">
        We&apos;ll email you as soon as your order ships.
      </p>

      <p className="mt-6 text-sm text-walnut/60">
        Need help using your new products? Your complimentary skincare consultation is still
        available —{" "}
        <a
          href={whatsappLink("Hi! I'd like some help using the products from my recent order.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-burgundy underline-offset-2 hover:underline"
        >
          <WhatsAppIcon className="h-3.5 w-3.5" />
          chat with our consultant
        </a>
        .
      </p>
    </div>
  );
}
