/**
 * Shipping configuration. Real rates have not been supplied by the business
 * yet, so nothing here invents a number — the UI reads `configured` and
 * shows "Shipping calculated at checkout" until this is filled in.
 *
 * To go live: set a method's `priceCents` (or `freeAbove`), flip
 * `configured` to true. Location-based zones can be added as additional
 * entries in `zones` without changing any consuming component.
 */

export type ShippingMethod = {
  id: string;
  label: string;
  description: string;
  /** Flat price in the smallest currency unit avoided — use whole rupees to
   * match the rest of the pricing model. Null = rate not yet configured. */
  price: number | null;
  /** Order subtotal (in rupees) at or above which this method becomes free. */
  freeAbove?: number;
  estimatedDelivery?: string;
};

export type ShippingZone = {
  id: string;
  label: string;
  countries: string[];
  methods: ShippingMethod[];
};

export const shippingConfigured = false;

export const codEnabled = false;

export const defaultZone: ShippingZone = {
  id: "india",
  label: "India",
  countries: ["India"],
  methods: [
    {
      id: "standard",
      label: "Standard Delivery",
      description: "Rate calculated at checkout.",
      price: null,
    },
  ],
};

export const shippingZones: ShippingZone[] = [defaultZone];

export function getShippingZoneForCountry(country: string): ShippingZone | undefined {
  return shippingZones.find((zone) =>
    zone.countries.some((c) => c.toLowerCase() === country.trim().toLowerCase()),
  );
}
