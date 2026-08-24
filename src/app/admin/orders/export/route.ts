import type { NextRequest } from "next/server";
import type { FulfilmentStatus, Prisma } from "@prisma/client";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatIstDateTime, istDayStart } from "@/lib/admin-time";

export const dynamic = "force-dynamic";

const FULFILMENT_VALUES: FulfilmentStatus[] = [
  "UNFULFILLED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const COLUMNS = [
  "Order Number",
  "Placed (IST)",
  "Customer",
  "Email",
  "Phone",
  "Payment Status",
  "Fulfilment Status",
  "Subtotal",
  "Discount",
  "Shipping",
  "Tax",
  "Total",
  "Currency",
  "Coupon",
  "Payment Method",
  "Courier",
  "Tracking Number",
  "Shipping City",
  "Shipping State",
  "Shipping Postal",
] as const;

/** RFC-4180 cell: quote when the value contains a comma, quote or newline,
 * and double any embedded quotes. */
function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  // This route is not behind middleware — it authorizes itself, exactly like
  // every admin page and action. No session ⇒ no data.
  if (!(await hasValidAdminSession())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const statusParam = params.get("status");
  const q = (params.get("q") ?? "").trim();

  const statusWhere: Prisma.OrderWhereInput =
    statusParam && FULFILMENT_VALUES.includes(statusParam as FulfilmentStatus)
      ? { fulfilmentStatus: statusParam as FulfilmentStatus }
      : {};
  const searchWhere: Prisma.OrderWhereInput = q
    ? {
        OR: [
          { orderNumber: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const orders = await prisma.order.findMany({
    where: { AND: [statusWhere, searchWhere] },
    orderBy: { createdAt: "desc" },
    take: 10000,
    select: {
      orderNumber: true,
      createdAt: true,
      customerName: true,
      email: true,
      phone: true,
      paymentStatus: true,
      fulfilmentStatus: true,
      subtotal: true,
      discount: true,
      shipping: true,
      tax: true,
      total: true,
      currency: true,
      paymentMethod: true,
      courierName: true,
      trackingNumber: true,
      shippingCity: true,
      shippingState: true,
      shippingPostal: true,
      coupon: { select: { code: true } },
    },
  });

  const rows = orders.map((o) =>
    [
      o.orderNumber,
      formatIstDateTime(o.createdAt),
      o.customerName ?? "",
      o.email,
      o.phone ?? "",
      o.paymentStatus,
      o.fulfilmentStatus,
      o.subtotal,
      o.discount,
      o.shipping,
      o.tax,
      o.total,
      o.currency,
      o.coupon?.code ?? "",
      o.paymentMethod ?? "",
      o.courierName ?? "",
      o.trackingNumber ?? "",
      o.shippingCity ?? "",
      o.shippingState ?? "",
      o.shippingPostal ?? "",
    ]
      .map(csvCell)
      .join(","),
  );

  // Leading BOM so Excel opens the UTF-8 file with the right encoding (names
  // and any non-ASCII fields render correctly). CRLF line endings per RFC-4180.
  const csv = "﻿" + [COLUMNS.join(","), ...rows].join("\r\n") + "\r\n";

  // Filename dated to the IST day, so exports sort chronologically on disk.
  const stamp = formatIstDateTime(istDayStart(new Date())).slice(0, 10);
  const filename = `skinshop-orders-${stamp}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
