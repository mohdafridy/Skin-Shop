"use client";

import { useActionState } from "react";
import { StarIcon } from "@/components/icons";
import { setReviewStatusAction, type AdminActionState } from "./actions";

const initialState: AdminActionState = null;

const statusStyles: Record<string, string> = {
  PENDING: "bg-sand text-walnut",
  APPROVED: "bg-olive/15 text-olive",
  REJECTED: "bg-burgundy/10 text-burgundy",
};

export default function ReviewRow({
  id,
  subjectName,
  subjectHref,
  rating,
  authorName,
  authorEmail,
  body,
  status,
  createdAt,
}: {
  id: string;
  subjectName: string;
  subjectHref: string;
  rating: number;
  authorName: string;
  authorEmail: string | null;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}) {
  const [state, formAction, pending] = useActionState(setReviewStatusAction, initialState);

  function submitStatus(nextStatus: "APPROVED" | "REJECTED") {
    const data = new FormData();
    data.set("reviewId", id);
    data.set("status", nextStatus);
    formAction(data);
  }

  return (
    <li className="rounded-2xl border border-gold/20 bg-white/50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <a href={subjectHref} className="text-sm font-medium text-burgundy hover:underline">
            {subjectName}
          </a>
          <div className="mt-1 flex items-center gap-1 text-gold" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <StarIcon key={n} filled={n <= rating} className="h-4 w-4" />
            ))}
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-walnut/80">{body}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-walnut/60">
        <span>
          {authorName}
          {authorEmail ? ` · ${authorEmail}` : ""} ·{" "}
          {new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>

        <div className="flex items-center gap-2">
          {status !== "APPROVED" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => submitStatus("APPROVED")}
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-ivory transition hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-50"
            >
              Approve
            </button>
          )}
          {status !== "REJECTED" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => submitStatus("REJECTED")}
              className="rounded-full border border-ink px-4 py-1.5 text-xs font-medium text-ink transition hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject
            </button>
          )}
        </div>
      </div>

      {(state?.error || state?.success) && (
        <p className={`mt-2 text-xs ${state.error ? "text-burgundy" : "text-olive"}`}>
          {state.error ?? state.success}
        </p>
      )}
    </li>
  );
}
