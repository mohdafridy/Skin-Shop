/**
 * Shipping configuration, as supplied by the business:
 * - Srinagar: flat ₹50.
 * - Rest of India: ₹120 up to 1kg, ₹150 above 1kg.
 * - Combo orders ship free everywhere.
 * - Estimated delivery: 5–6 working days.
 *
 * Per-order parcel weight isn't tracked anywhere in the product data yet
 * (src/data/products.ts has no weight field), so the >1kg / ₹150 tier can't
 * be applied automatically — every non-Srinagar, non-combo order is charged
 * the ≤1kg rate (₹120) until real per-product weights are supplied. Nothing
 * here invents a weight to work around that.
 */

export type ShippingMethod = {
  id: string;
  label: string;
  description: string;
  /** Representative rate for display in the delivery-method list — the
   * actual per-order charge (which varies by city and combo contents) is
   * computed by calculateShippingCost(). */
  price: number | null;
  estimatedDelivery?: string;
};

export type ShippingZone = {
  id: string;
  label: string;
  countries: string[];
  methods: ShippingMethod[];
};

export const shippingConfigured = true;

export const codEnabled = false;

export const SRINAGAR_SHIPPING_RATE = 50;
// Rest of India, ≤1kg. See file header re: the un-implemented >1kg/₹150 tier.
export const STANDARD_SHIPPING_RATE = 120;
export const STANDARD_DELIVERY_ESTIMATE = "5–6 working days";

function isSrinagar(city: string): boolean {
  return city.trim().toLowerCase() === "srinagar";
}

/** Authoritative shipping cost for an order — call this both for checkout
 * display and (never trusting the client's number) at order creation. */
export function calculateShippingCost({
  city,
  hasFreeShippingItem,
}: {
  city: string;
  /** True if the order contains a combo — combos ship free. */
  hasFreeShippingItem: boolean;
}): number {
  if (hasFreeShippingItem) return 0;
  if (isSrinagar(city)) return SRINAGAR_SHIPPING_RATE;
  return STANDARD_SHIPPING_RATE;
}

export const defaultZone: ShippingZone = {
  id: "india",
  label: "India",
  countries: ["India"],
  methods: [
    {
      id: "standard",
      label: "Standard Delivery",
      description:
        "₹50 to Srinagar, ₹120 elsewhere in India (up to 1kg) — free on combo orders.",
      price: STANDARD_SHIPPING_RATE,
      estimatedDelivery: STANDARD_DELIVERY_ESTIMATE,
    },
  ],
};

export const shippingZones: ShippingZone[] = [defaultZone];

export function getShippingZoneForCountry(country: string): ShippingZone | undefined {
  return shippingZones.find((zone) =>
    zone.countries.some((c) => c.toLowerCase() === country.trim().toLowerCase()),
  );
}
