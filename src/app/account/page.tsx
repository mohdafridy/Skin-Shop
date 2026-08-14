import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { FulfilmentStatusBadge, PaymentStatusBadge } from "@/components/OrderStatusBadge";
import AccountAuthForm from "./AccountAuthForm";
import SignOutButton from "./SignOutButton";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in to see your order history at The Skin Shop.",
  robots: noIndex,
};

// Always per-request. Without this the page prerenders static whenever
// DATABASE_URL is absent at build time (getCurrentUser returns before it
// reads cookies), which would freeze the signed-out view even after a
// database is connected at runtime.
export const dynamic = "force-dynamic";

async function getOrders(userId: string) {
  try {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { items: true },
    });
  } catch {
    return [];
  }
}

export default async function AccountPage() {
  const accountsEnabled = Boolean(process.env.DATABASE_URL);
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 sm:px-8">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
          Your Account
        </p>
        <h1 className="text-balance text-center font-display text-4xl leading-tight text-ink">
          Welcome Back
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-balance text-center leading-relaxed text-walnut/75">
          An account keeps your order history in one place. It&apos;s optional — checkout
          works perfectly well as a guest.
        </p>
        <div className="mt-10">
          <AccountAuthForm accountsEnabled={accountsEnabled} />
        </div>
      </div>
    );
  }

  const orders = await getOrders(user.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
            Your Account
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink">
            {user.name ?? "Welcome"}
          </h1>
          <p className="mt-2 text-sm text-walnut/70">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <h2 className="mt-14 font-display text-2xl text-ink">Order History</h2>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-gold/20 bg-white/40 p-8 text-center">
          <p className="text-walnut/75">No orders yet.</p>
          <Link
            href="/shop"
            className="mt-5 inline-block rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark"
          >
            Explore The Collection
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-gold/20 bg-white/40 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-ink">{order.orderNumber}</p>
                <p className="text-sm text-walnut/70">
                  {order.createdAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <PaymentStatusBadge status={order.paymentStatus} />
                <FulfilmentStatusBadge status={order.fulfilmentStatus} paymentStatus={order.paymentStatus} />
              </div>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-burgundy underline-offset-2 hover:underline"
                >
                  Track shipment →
                </a>
              )}
              <ul className="mt-3 space-y-1 text-sm text-walnut/80">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} &times;{item.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-gold/20 pt-3 text-sm font-medium text-ink">
                Total {formatPrice(order.total, order.currency)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
