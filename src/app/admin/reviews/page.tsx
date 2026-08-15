import type { Metadata } from "next";
import Link from "next/link";
import type { ReviewStatus } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "../AdminHeader";
import ReviewRow from "./ReviewRow";

export const metadata: Metadata = { title: "Reviews", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const filters: { label: string; value: ReviewStatus | "ALL" }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All", value: "ALL" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminSession();
  const { status } = await searchParams;
  const activeFilter = filters.find((f) => f.value === status)?.value ?? "PENDING";

  const reviews = await prisma.review.findMany({
    where: activeFilter === "ALL" ? {} : { status: activeFilter },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      product: { select: { name: true, slug: true } },
      combo: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <AdminHeader title="Reviews" />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value === "PENDING" ? "/admin/reviews" : `/admin/reviews?status=${f.value}`}
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

      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-gold/20 bg-white/40 p-8 text-center text-walnut/70">
          No reviews here.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const subjectName = review.product?.name ?? review.combo?.name ?? "Unknown";
            const subjectHref =
              review.type === "PRODUCT"
                ? `/products/${review.product?.slug ?? ""}`
                : `/rituals#${review.combo?.slug ?? ""}`;
            return (
              <ReviewRow
                key={review.id}
                id={review.id}
                subjectName={subjectName}
                subjectHref={subjectHref}
                rating={review.rating}
                authorName={review.authorName}
                authorEmail={review.authorEmail}
                body={review.body}
                status={review.status}
                createdAt={review.createdAt.toISOString()}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
