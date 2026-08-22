"use client";

import { useActionState, useRef, useState } from "react";
import { createCouponAction, type AdminActionState } from "./actions";

const initialState: AdminActionState = null;

/**
 * Owner's coupon generator. The code is typed by the owner (their choice of
 * word), single-use is implied — the copy makes that clear — and nothing here
 * is ever rendered on the storefront. On success the field clears so the next
 * exclusive code can be created straight away.
 */
export default function CouponForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");

  const [state, formAction, pending] = useActionState(
    async (prev: AdminActionState, formData: FormData) => {
      const result = await createCouponAction(prev, formData);
      if (result?.success) formRef.current?.reset();
      return result;
    },
    initialState,
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-gold/20 bg-white/50 p-6"
    >
      <h2 className="font-display text-xl text-ink">Create a one-time code</h2>
      <p className="mt-1 text-sm text-walnut/70">
        Every code is single-use. Give it to a chosen customer privately — it&apos;s
        never shown anywhere on the shop.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-walnut/70">
            Code
          </span>
          <input
            name="code"
            required
            autoComplete="off"
            placeholder="e.g. AISHA10"
            className="mt-1 w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm uppercase tracking-wide text-ink outline-none focus:border-burgundy"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-walnut/70">
            Discount type
          </span>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}
            className="mt-1 w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy"
          >
            <option value="PERCENTAGE">Percentage off (%)</option>
            <option value="FIXED">Fixed amount off (₹)</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-walnut/70">
            {type === "PERCENTAGE" ? "Percent off" : "Rupees off"}
          </span>
          <input
            name="value"
            type="number"
            required
            min={1}
            max={type === "PERCENTAGE" ? 100 : undefined}
            placeholder={type === "PERCENTAGE" ? "10" : "100"}
            className="mt-1 w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-walnut/70">
            Minimum spend (₹) — optional
          </span>
          <input
            name="minimumSubtotal"
            type="number"
            min={0}
            placeholder="No minimum"
            className="mt-1 w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-walnut/70">
            Expires — optional
          </span>
          <input
            name="expiresAt"
            type="date"
            className="mt-1 w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create code"}
        </button>
        {(state?.error || state?.success) && (
          <p className={`text-sm ${state.error ? "text-burgundy" : "text-olive"}`}>
            {state.error ?? state.success}
          </p>
        )}
      </div>
    </form>
  );
}
