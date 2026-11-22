"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { addProductStockAction, updateProductStockAction, type AdminActionState } from "./actions";

type Props = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  image: string;
  price: number;
  currency: string;
  stock: number | null;
  active: boolean;
  newBadge?: { durationDays: number; daysRemaining: number };
};
const emptyState: AdminActionState = null;
const stockInput = "w-32 rounded-lg border border-gold/35 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";

export default function ProductRow(props: Props) {
  const { id, slug, name, category, collection, image, price, currency, stock, active, newBadge } = props;
  const [state, updateAction, updating] = useActionState(updateProductStockAction, emptyState);
  const [addState, addAction, adding] = useActionState(addProductStockAction, emptyState);
  const [stockValue, setStockValue] = useState(stock === null ? "" : String(stock));
  const [activeValue, setActiveValue] = useState(active);
  const [addAmount, setAddAmount] = useState("");
  const [inventoryOpen, setInventoryOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-gold/25 bg-white/65 shadow-[0_4px_20px_rgba(69,48,42,0.025)]">
      <div className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap sm:p-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gold/15 bg-sand/50">
          {image && <Image src={image} alt="" fill sizes="80px"
            unoptimized={image.startsWith("https://")} className="object-cover" />}
        </div>
        <div className="min-w-[150px] flex-1">
          <h3 className="font-display text-xl leading-tight text-ink">{name}</h3>
          <p className="mt-1 text-xs text-walnut/60">{collection} · {category}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {!active
              ? <span className="rounded-md bg-walnut/10 px-2.5 py-1 text-[0.65rem] font-semibold text-walnut">Hidden</span>
              : stock === 0
                ? <span className="rounded-md bg-burgundy/10 px-2.5 py-1 text-[0.65rem] font-semibold text-burgundy">Sold out</span>
                : <span className="rounded-md bg-olive/10 px-2.5 py-1 text-[0.65rem] font-semibold text-olive">Published</span>}
            {newBadge && <span className={"rounded-md border px-2.5 py-1 text-[0.65rem] font-semibold " +
              (newBadge.daysRemaining > 0 ? "border-gold/40 bg-gold/10 text-walnut" : "border-walnut/15 bg-walnut/5 text-walnut/60")}>
              {newBadge.daysRemaining > 0 ? "✦ NEW · " + newBadge.daysRemaining + "d left" : "NEW expired"}
            </span>}
          </div>
        </div>
        <div className="min-w-[95px]">
          <p className="font-display text-[1.35rem] leading-none text-ink">{formatPrice(price, currency)}</p>
          <p className="mt-1.5 text-xs text-walnut/60">
            {stock === null ? "Unlimited stock" : stock + " in stock"}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Link href={"/admin/products/" + id + "/edit"}
            className="rounded-full bg-burgundy px-5 py-2.5 text-xs font-semibold text-ivory transition-colors hover:bg-burgundy-dark">
            Edit product
          </Link>
          {active && <Link href={"/products/" + slug} target="_blank" rel="noopener noreferrer"
            className="rounded-full border border-gold/50 px-4 py-2.5 text-xs font-semibold text-ink hover:border-burgundy">
            View shop
          </Link>}
          <button type="button" onClick={() => setInventoryOpen(!inventoryOpen)}
            aria-expanded={inventoryOpen} aria-controls={"inventory-" + id}
            className="rounded-full border border-gold/50 px-4 py-2.5 text-xs font-semibold text-walnut hover:border-burgundy">
            {inventoryOpen ? "Close stock" : "Quick stock"}
          </button>
        </div>
      </div>

      {inventoryOpen && (
        <div id={"inventory-" + id} className="border-t border-gold/20 bg-sand/20 px-4 py-5 sm:px-6">
          <p className="mb-4 text-sm font-semibold text-ink">Inventory &amp; availability</p>
          <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
            <form action={updateAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="productId" value={id} />
              <input type="hidden" name="active" value={activeValue ? "true" : "false"} />
              <label className="block text-xs font-semibold text-walnut/70">
                Available quantity
                <input type="number" min={0} name="stock" value={stockValue} placeholder="Unlimited"
                  onChange={(e) => setStockValue(e.target.value)} className={"mt-1.5 block " + stockInput} />
              </label>
              <label className="flex h-10 items-center gap-2 text-xs font-semibold text-ink">
                <input type="checkbox" checked={activeValue}
                  onChange={(e) => setActiveValue(e.target.checked)} className="h-4 w-4 accent-burgundy" />
                Published
              </label>
              <button type="submit" disabled={updating}
                className="rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-ivory disabled:opacity-50">
                {updating ? "Saving…" : "Save stock"}
              </button>
              {(state?.error || state?.success) && <span role="status" className={"basis-full text-xs " +
                (state.error ? "text-burgundy" : "text-olive")}>{state.error ?? state.success}</span>}
            </form>

            <form action={addAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="productId" value={id} />
              <label className="block text-xs font-semibold text-walnut/70">
                Add stock quickly
                <input type="number" name="amount" min={1} value={addAmount} placeholder="Quantity"
                  onChange={(e) => setAddAmount(e.target.value)} className={"mt-1.5 block " + stockInput} />
              </label>
              <button type="submit" disabled={adding || !addAmount}
                className="rounded-full border border-burgundy px-4 py-2.5 text-xs font-semibold text-burgundy disabled:opacity-50">
                {adding ? "Adding…" : "Add stock"}
              </button>
              {(addState?.error || addState?.success) && <span role="status" className={"basis-full text-xs " +
                (addState.error ? "text-burgundy" : "text-olive")}>{addState.error ?? addState.success}</span>}
            </form>
          </div>
          <p className="mt-4 text-xs text-walnut/60">Leave stock empty for unlimited. Set stock to 0 to mark sold out. Uncheck Published to hide a product from the shop.</p>
        </div>
      )}
    </article>
  );
}
