import { formatPrice } from "@/lib/format";
import { taxConfigured, calculateTax } from "@/data/tax";
import { shippingConfigured } from "@/data/shipping";
import SmartImage from "@/components/SmartImage";

export type OrderLine = {
  type: "product" | "combo";
  slug: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
};

export default function OrderSummary({
  lines,
  subtotal,
  discount,
  currency,
  /** Null until enough of the shipping address is known to price it (e.g.
   * city not entered yet). */
  shippingCost,
}: {
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  currency: string;
  shippingCost: number | null;
}) {
  const tax = calculateTax(subtotal - discount);
  const knownShipping = shippingConfigured && shippingCost !== null;
  const total = subtotal - discount + (tax ?? 0) + (knownShipping ? shippingCost : 0);

  return (
    <div className="rounded-md border border-gold/20 bg-white/50 p-6">
      <h2 className="mb-5 font-display text-xl text-ink">Order Summary</h2>

      <ul className="space-y-4">
        {lines.map((line) => (
          <li key={`${line.type}:${line.slug}`} className="flex items-center gap-3">
            <SmartImage
              src={line.image}
              alt={line.name}
              label={line.name}
              className="h-16 w-16 flex-shrink-0 rounded-lg"
              sizes="64px"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {line.name}
                {line.type === "combo" && (
                  <span className="ml-1.5 text-xs font-normal text-walnut/50">(Combo)</span>
                )}
              </p>
              <p className="text-xs text-walnut/60">
                Qty {line.quantity} × {formatPrice(line.price, line.currency)}
              </p>
            </div>
            <span className="flex-shrink-0 text-sm font-medium text-ink">
              {formatPrice(line.price * line.quantity, line.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 border-t border-gold/20 pt-5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-walnut/70">Subtotal</span>
          <span className="text-ink">{formatPrice(subtotal, currency)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-olive">
            <span>Discount</span>
            <span>&minus;{formatPrice(discount, currency)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-walnut/70">Shipping</span>
          <span className={knownShipping && shippingCost === 0 ? "text-olive" : "text-walnut/70"}>
            {!knownShipping
              ? "Calculated at checkout"
              : shippingCost === 0
                ? "Free"
                : formatPrice(shippingCost, currency)}
          </span>
        </div>
        {taxConfigured && (
          <div className="flex items-center justify-between">
            <span className="text-walnut/70">Tax</span>
            <span className="text-ink">{formatPrice(tax ?? 0, currency)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gold/20 pt-2 text-base font-medium text-ink">
          <span>{knownShipping ? "Total" : "Total (before shipping)"}</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}
