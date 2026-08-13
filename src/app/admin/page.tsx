import type { Metadata } from "next";
import Link from "next/link";
import type { FulfilmentStatus } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { StatusPill, paymentLabels, fulfilmentLabels } from "@/components/OrderStatusBadge";
import AdminHeader from "./AdminHeader";

export const metadata: Metadata = { title: "Orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const filters: { label: string; value: FulfilmentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Unfulfilled", value: "UNFULFILLED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Packed", value: "PACKED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Out for delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminSession();
  const { status } = await searchParams;
  const activeFilter = filters.find((f) => f.value === status)?.value ?? "ALL";

  const orders = await prisma.order.findMany({
    where: activeFilter === "ALL" ? {} : { fulfilmentStatus: activeFilter },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      email: true,
      total: true,
      currency: true,
      paymentStatus: true,
      fulfilmentStatus: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <AdminHeader title="Orders" />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value === "ALL" ? "/admin" : `/admin?status=${f.value}`}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              activeFilter === f.value
                ? "bg-burgundy text-ivory"
                : "border border-gold/30 text-walnut/75 hover:border-burgundy"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-gold/20 bg-white/40 p-8 text-center text-walnut/70">
          No orders here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gold/20">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold/20 bg-sand/30 text-xs uppercase tracking-wide text-walnut/60">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Fulfilment</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-sand/20">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-ink underline-offset-2 hover:text-burgundy hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-walnut/80">
                    <div>{order.customerName || "—"}</div>
                    <div className="text-xs text-walnut/60">{order.email}</div>
                  </td>
                  <td className="px-4 py-3 text-walnut/70">
                    {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill {...paymentLabels[order.paymentStatus]} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill {...fulfilmentLabels[order.fulfilmentStatus]} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-ink">
                    {formatPrice(order.total, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
