"use client";

import { useActionState, useState } from "react";
import { updateProductStockAction, type AdminActionState } from "./actions";

const initialState: AdminActionState = null;

const inputClass =
  "w-24 rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-burgundy";

export default function ProductRow({
  id,
  name,
  category,
  stock,
  active,
}: {
  id: string;
  name: string;
  category: string;
  stock: number | null;
  active: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateProductStockAction, initialState);
  const [stockValue, setStockValue] = useState(stock === null ? "" : String(stock));
  const [activeValue, setActiveValue] = useState(active);

  const isOutOfStock = activeValue === false || stockValue === "0";

  return (
    <tr className="transition hover:bg-sand/20">
      <td className="px-4 py-3">
        <div className="font-medium text-ink">{name}</div>
        <div className="text-xs text-walnut/60">{category}</div>
      </td>
      <td className="px-4 py-3">
        {isOutOfStock ? (
          <span className="rounded-full bg-burgundy/10 px-3 py-1 text-xs font-medium text-burgundy">
            Out of stock
          </span>
        ) : (
          <span className="rounded-full bg-olive/10 px-3 py-1 text-xs font-medium text-olive">In stock</span>
        )}
      </td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="productId" value={id} />
          <input type="hidden" name="active" value={activeValue ? "true" : "false"} />

          <div>
            <label className="sr-only" htmlFor={`stock-${id}`}>
              Stock quantity
            </label>
            <input
              id={`stock-${id}`}
              name="stock"
              type="number"
              min={0}
              placeholder="Unlimited"
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
              className={inputClass}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-walnut/80">
            <input
              type="checkbox"
              checked={activeValue}
              onChange={(e) => setActiveValue(e.target.checked)}
              className="h-4 w-4 rounded border-gold/40 text-burgundy focus:ring-burgundy"
            />
            Active
          </label>

          <button
            type="button"
            onClick={() => setStockValue("0")}
            className="text-xs font-medium text-burgundy underline-offset-2 hover:underline"
          >
            Mark out of stock
          </button>

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-ivory transition hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>

          {(state?.error || state?.success) && (
            <span className={`text-xs ${state.error ? "text-burgundy" : "text-olive"}`}>
              {state.error ?? state.success}
            </span>
          )}
        </form>
      </td>
    </tr>
  );
}
