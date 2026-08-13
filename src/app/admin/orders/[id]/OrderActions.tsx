"use client";

import { useActionState, useState } from "react";
import type { FulfilmentStatus, PaymentStatus } from "@prisma/client";
import { formatPrice } from "@/lib/format";
import { fulfilmentLabels, paymentLabels } from "@/components/OrderStatusBadge";
import { issueRefundAction, overridePaymentStatusAction, updateFulfilmentAction, type AdminActionState } from "./actions";

const initialState: AdminActionState = null;

const selectClass =
  "w-full rounded-xl border border-gold/30 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-burgundy";
const inputClass = selectClass;
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

function ActionMessage({ state }: { state: AdminActionState }) {
  if (!state?.error && !state?.success) return null;
  return (
    <p
      role="status"
      className={`mt-3 rounded-xl px-4 py-2.5 text-sm ${
        state.error ? "bg-burgundy/10 text-burgundy" : "bg-olive/10 text-olive"
      }`}
    >
      {state.error ?? state.success}
    </p>
  );
}

export default function OrderActions({
  orderId,
  fulfilmentStatus,
  paymentStatus,
  courierName,
  trackingNumber,
  trackingUrl,
  notes,
  razorpayConfigured,
  orderTotal,
}: {
  orderId: string;
  fulfilmentStatus: FulfilmentStatus;
  paymentStatus: PaymentStatus;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  notes: string | null;
  razorpayConfigured: boolean;
  orderTotal: number;
}) {
  const [fulfilmentState, fulfilmentAction, fulfilmentPending] = useActionState(
    updateFulfilmentAction,
    initialState,
  );
  const [paymentState, paymentAction, paymentPending] = useActionState(
    overridePaymentStatusAction,
    initialState,
  );
  const [refundState, refundAction, refundPending] = useActionState(issueRefundAction, initialState);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [statusValue, setStatusValue] = useState<FulfilmentStatus>(fulfilmentStatus);
  const [paymentOverrideValue, setPaymentOverrideValue] = useState<PaymentStatus>(paymentStatus);
  const [courierError, setCourierError] = useState<string | null>(null);

  /**
   * A rejected Server Action round-trip re-renders this component from
   * scratch with fresh props (Next.js remounts client components after a
   * revalidatePath, the same as a real navigation — plain <input>s only
   * *look* unaffected because a successful save re-serves the exact value
   * you typed as the new prop). Losing an admin's "Shipped" selection the
   * moment they're told to add a courier and resubmit would mean the retry
   * silently goes out as their *old* status. So the one validation this
   * form can reject is checked here, client-side, before the action ever
   * runs — the server keeps the same check for defense in depth, but the
   * happy path never round-trips through a state-resetting rejection.
   */
  function handleFulfilmentSubmit(e: React.FormEvent<HTMLFormElement>) {
    const submittedCourier = String(new FormData(e.currentTarget).get("courierName") ?? "").trim();
    if (statusValue === "SHIPPED" && !submittedCourier && !courierName) {
      e.preventDefault();
      setCourierError("Courier name is required to mark an order Shipped.");
      return;
    }
    setCourierError(null);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-gold/20 bg-white/50 p-6">
        <h2 className="font-display text-xl text-ink">Fulfilment</h2>
        <p className="mt-1 text-sm text-walnut/70">
          Shipping is booked manually — enter the courier and tracking details, then mark the order
          Shipped. The customer is notified by WhatsApp and email automatically.
        </p>

        <form action={fulfilmentAction} onSubmit={handleFulfilmentSubmit} className="mt-5 space-y-4">
          <input type="hidden" name="orderId" value={orderId} />

          <div>
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value as FulfilmentStatus)}
              className={selectClass}
            >
              {Object.entries(fulfilmentLabels).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="courierName">
                Courier
              </label>
              <input
                id="courierName"
                name="courierName"
                defaultValue={courierName ?? ""}
                placeholder="e.g. Delhivery, India Post"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="trackingNumber">
                Tracking number
              </label>
              <input
                id="trackingNumber"
                name="trackingNumber"
                defaultValue={trackingNumber ?? ""}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="trackingUrl">
              Tracking URL
            </label>
            <input
              id="trackingUrl"
              name="trackingUrl"
              type="url"
              defaultValue={trackingUrl ?? ""}
              placeholder="https://…"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="notes">
              Internal notes (never shown to the customer)
            </label>
            <textarea id="notes" name="notes" rows={2} defaultValue={notes ?? ""} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={fulfilmentPending}
            className="rounded-full bg-burgundy px-6 py-2.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fulfilmentPending ? "Saving…" : "Save fulfilment status"}
          </button>
          <ActionMessage state={courierError ? { error: courierError } : fulfilmentState} />
        </form>
      </section>

      {paymentStatus === "PAID" && (
        <section className="rounded-2xl border border-gold/20 bg-white/50 p-6">
          <h2 className="font-display text-xl text-ink">Refund</h2>
          <p className="mt-1 text-sm text-walnut/70">
            Refunds go through Razorpay directly. Leave the amount blank for a full refund of{" "}
            {formatPrice(orderTotal, "INR")}.
          </p>

          {!razorpayConfigured ? (
            <p className="mt-4 rounded-xl border border-dashed border-gold/40 bg-sand/40 px-4 py-3 text-sm text-walnut/75">
              Razorpay isn&apos;t connected yet, so refunds can&apos;t be issued from here.
            </p>
          ) : (
            <form
              action={refundAction}
              onSubmit={(e) => {
                if (!window.confirm("Issue this refund? This charges the customer's original payment method in reverse and can't be undone.")) {
                  e.preventDefault();
                }
              }}
              className="mt-4 flex flex-wrap items-end gap-3"
            >
              <input type="hidden" name="orderId" value={orderId} />
              <div>
                <label className={labelClass} htmlFor="amount">
                  Amount (optional)
                </label>
                <input id="amount" name="amount" type="number" min={1} max={orderTotal} placeholder="Full refund" className={`${inputClass} w-40`} />
              </div>
              <button
                type="submit"
                disabled={refundPending}
                className="rounded-full border border-burgundy px-6 py-2.5 text-sm font-medium text-burgundy transition hover:bg-burgundy hover:text-ivory disabled:cursor-not-allowed disabled:opacity-50"
              >
                {refundPending ? "Processing…" : "Issue refund"}
              </button>
            </form>
          )}
          <ActionMessage state={refundState} />
        </section>
      )}

      <section className="rounded-2xl border border-dashed border-gold/40 bg-sand/30 p-6">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-sm font-medium text-walnut/75 underline-offset-2 hover:text-ink hover:underline"
        >
          {showAdvanced ? "Hide" : "Show"} advanced: manually override payment status
        </button>
        {showAdvanced && (
          <div className="mt-4">
            <p className="mb-3 text-xs text-walnut/70">
              Only for correcting the record after something was resolved directly in the Razorpay
              dashboard (e.g. a manual refund). This does not charge or refund anything itself.
            </p>
            <form action={paymentAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="orderId" value={orderId} />
              <div>
                <label className={labelClass} htmlFor="paymentStatusOverride">
                  Payment status
                </label>
                <select
                  id="paymentStatusOverride"
                  name="status"
                  value={paymentOverrideValue}
                  onChange={(e) => setPaymentOverrideValue(e.target.value as PaymentStatus)}
                  className={`${selectClass} w-56`}
                >
                  {Object.entries(paymentLabels).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={paymentPending}
                className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentPending ? "Saving…" : "Override"}
              </button>
            </form>
            <ActionMessage state={paymentState} />
          </div>
        )}
      </section>
    </div>
  );
}
