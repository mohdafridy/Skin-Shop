"use client";

import { useActionState } from "react";
import { setCouponActiveAction, type AdminActionState } from "./actions";

const initialState: AdminActionState = null;

export default function CouponRow({
  id,
  code,
  label,
  minimumSubtotal,
  used,
  active,
  expiresAt,
  createdAt,
}: {
  id: string;
  code: string;
  label: string;
  minimumSubtotal: number | null;
  used: boolean;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}) {
  const [state, formAction, pending] = useActionState(setCouponActiveAction, initialState);

  const expired = expiresAt != null && new Date(expiresAt) < new Date();

  let status: { text: string; className: string };
  if (used) status = { text: "Redeemed", className: "bg-olive/15 text-olive" };
  else if (expired) status = { text: "Expired", className: "bg-burgundy/10 text-burgundy" };
  else if (!active) status = { text: "Disabled", className: "bg-sand text-walnut" };
  else status = { text: "Available", className: "bg-burgundy/10 text-burgundy" };

  return (
    <li className="rounded-2xl border border-gold/20 bg-white/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-semibold uppercase tracking-wide text-ink">
            {code}
          </p>
          <p className="mt-1 text-sm text-walnut/75">
            {label}
            {minimumSubtotal ? ` · min ₹${minimumSubtotal}` : ""}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
          {status.text}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-walnut/60">
        <span>
          Created{" "}
          {new Date(createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          {expiresAt
            ? ` · expires ${new Date(expiresAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`
            : " · no expiry"}
        </span>

        {!used && (
          <form action={formAction}>
            <input type="hidden" name="couponId" value={id} />
            <input type="hidden" name="active" value={active ? "false" : "true"} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-full border border-ink px-4 py-1.5 text-xs font-medium text-ink transition hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:opacity-50"
            >
              {active ? "Disable" : "Enable"}
            </button>
          </form>
        )}
      </div>

      {state?.error && <p className="mt-2 text-xs text-burgundy">{state.error}</p>}
    </li>
  );
}
