import type { Metadata } from "next";
import Link from "next/link";
import type { FulfilmentStatus, Prisma } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { StatusPill, paymentLabels, fulfilmentLabels } from "@/components/OrderStatusBadge";
import AdminHeader from "./AdminHeader";
import { istMonthStart, istDayStart } from "@/lib/admin-time";

export const metadata: Metadata = { title: "Orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// A product with a set stock at or below this is surfaced as "low stock" so
// the owner can restock before selling out. Stock-untracked products (null)
// are never counted.
const LOW_STOCK_THRESHOLD = 5;

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

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-walnut/60">{label}</p>
      <p className={`mt-1 font-display text-2xl ${accent ? "text-burgundy" : "text-ink"}`}>{value}</p>
    </>
  );
  const className = `block rounded-2xl border border-gold/20 bg-white/50 p-4 ${
    href ? "transition hover:border-burgundy" : ""
  }`;
  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdminSession();
  const { status, q: rawQ } = await searchParams;
  const activeFilter = filters.find((f) => f.value === status)?.value ?? "ALL";
  const q = (rawQ ?? "").trim();

  // At-a-glance figures. Windows are anchored to the shop's timezone (IST),
  // not the server's UTC, so "today" and "this month" mean what the owner
  // expects. Revenue counts only orders the gateway actually collected.
  const now = new Date();
  const todayStart = istDayStart(now);
  const monthStart = istMonthStart(now);

  const [ordersToday, monthRevenue, unfulfilledCount, lowStockCount] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID", createdAt: { gte: monthStart } },
    }),
    prisma.order.count({ where: { fulfilmentStatus: "UNFULFILLED" } }),
    prisma.product.count({ where: { active: true, stock: { lte: LOW_STOCK_THRESHOLD } } }),
  ]);
  const revenueThisMonth = monthRevenue._sum.total ?? 0;

  // Search matches an order number, customer name, email or phone. It layers
  // on top of the status filter so you can search within a status if wanted.
  const statusWhere: Prisma.OrderWhereInput =
    activeFilter === "ALL" ? {} : { fulfilmentStatus: activeFilter };
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
  const where: Prisma.OrderWhereInput = { AND: [statusWhere, searchWhere] };

  const orders = await prisma.order.findMany({
    where,
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

  // Preserve the active status filter and search term when exporting, so the
  // download matches exactly what's on screen.
  const exportParams = new URLSearchParams();
  if (activeFilter !== "ALL") exportParams.set("status", activeFilter);
  if (q) exportParams.set("q", q);
  const exportHref = `/admin/orders/export${exportParams.toString() ? `?${exportParams}` : ""}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <AdminHeader title="Orders" />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Orders today" value={String(ordersToday)} />
        <StatCard label="Revenue this month" value={formatPrice(revenueThisMonth, "INR")} accent />
        <StatCard
          label="Unfulfilled"
          value={String(unfulfilledCount)}
          href="/admin?status=UNFULFILLED"
        />
        <StatCard label="Low stock" value={String(lowStockCount)} href="/admin/products" />
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-center gap-2">
        {activeFilter !== "ALL" && <input type="hidden" name="status" value={activeFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search order #, name, email or phone"
          className="min-w-0 flex-1 rounded-full border border-gold/30 bg-white px-4 py-2 text-sm text-ink outline-none transition focus:border-burgundy"
        />
        <button
          type="submit"
          className="rounded-full bg-burgundy px-5 py-2 text-sm font-medium text-ivory transition hover:bg-ink"
        >
          Search
        </button>
        {q && (
          <Link
            href={activeFilter === "ALL" ? "/admin" : `/admin?status=${activeFilter}`}
            className="rounded-full border border-gold/30 px-4 py-2 text-sm text-walnut/75 transition hover:border-burgundy"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const params = new URLSearchParams();
            if (f.value !== "ALL") params.set("status", f.value);
            if (q) params.set("q", q);
            const href = params.toString() ? `/admin?${params}` : "/admin";
            return (
              <Link
                key={f.value}
                href={href}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  activeFilter === f.value
                    ? "bg-burgundy text-ivory"
                    : "border border-gold/30 text-walnut/75 hover:border-burgundy"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <a
          href={exportHref}
          className="rounded-full border border-ink px-4 py-1.5 text-xs font-medium text-ink transition hover:bg-ink hover:text-ivory"
        >
          Export CSV
        </a>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-gold/20 bg-white/40 p-8 text-center text-walnut/70">
          {q ? `No orders match “${q}”.` : "No orders here."}
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
