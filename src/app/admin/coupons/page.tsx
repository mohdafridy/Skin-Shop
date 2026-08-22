import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "../AdminHeader";
import CouponForm from "./CouponForm";
import CouponRow from "./CouponRow";

export const metadata: Metadata = { title: "Coupons", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function describe(type: "PERCENTAGE" | "FIXED", value: number): string {
  return type === "PERCENTAGE" ? `${value}% off` : `₹${value} off`;
}

export default async function AdminCouponsPage() {
  await requireAdminSession();

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
      <AdminHeader title="Coupons" />

      <CouponForm />

      <h2 className="mb-4 mt-10 font-display text-xl text-ink">Codes you&apos;ve created</h2>

      {coupons.length === 0 ? (
        <p className="rounded-2xl border border-gold/20 bg-white/40 p-8 text-center text-walnut/70">
          No codes yet. Create one above and give it to a customer.
        </p>
      ) : (
        <ul className="space-y-4">
          {coupons.map((c) => (
            <CouponRow
              key={c.id}
              id={c.id}
              code={c.code}
              label={describe(c.type, c.value)}
              minimumSubtotal={c.minimumSubtotal}
              used={c.timesUsed > 0}
              active={c.active}
              expiresAt={c.expiresAt?.toISOString() ?? null}
              createdAt={c.createdAt.toISOString()}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
