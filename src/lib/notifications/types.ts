import type { Prisma } from "@prisma/client";

/**
 * The exact order shape notifications need. Declared as a Prisma payload type
 * so a schema change surfaces here at compile time rather than as a missing
 * field in a live email.
 */
export const orderForNotificationSelect = {
  id: true,
  orderNumber: true,
  accessToken: true,
  email: true,
  phone: true,
  customerName: true,
  currency: true,
  subtotal: true,
  discount: true,
  shipping: true,
  tax: true,
  total: true,
  paymentStatus: true,
  fulfilmentStatus: true,
  paymentMethod: true,
  courierName: true,
  trackingNumber: true,
  trackingUrl: true,
  shippingName: true,
  shippingLine1: true,
  shippingLine2: true,
  shippingCity: true,
  shippingState: true,
  shippingPostal: true,
  shippingCountry: true,
  items: {
    select: { name: true, quantity: true, unitPrice: true, lineTotal: true },
  },
} satisfies Prisma.OrderSelect;

export type OrderForNotification = Prisma.OrderGetPayload<{
  select: typeof orderForNotificationSelect;
}>;
