"use client";

import { useActionState, useState } from "react";
import type { SavedAddress } from "@/lib/addresses";
import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
  type AddressActionState,
} from "./actions";

const initial: AddressActionState = null;

function AddressForm({
  address,
  onDone,
}: {
  address?: SavedAddress;
  onDone: () => void;
}) {
  const editing = Boolean(address);
  const [state, formAction, pending] = useActionState(
    async (prev: AddressActionState, formData: FormData) => {
      const result = editing
        ? await updateAddressAction(prev, formData)
        : await createAddressAction(prev, formData);
      if (result?.success) onDone();
      return result;
    },
    initial,
  );

  return (
    <form action={formAction} className="rounded-2xl border border-gold/25 bg-white/60 p-5">
      {editing && <input type="hidden" name="addressId" value={address!.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-walnut/70">
            Label — optional
          </span>
          <input
            name="label"
            defaultValue={address?.label ?? ""}
            placeholder="Home, Office…"
            className="mt-1 w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy"
          />
        </label>
        <FormInput name="name" label="Full name" defaultValue={address?.name} autoComplete="name" />
        <FormInput name="phone" label="Phone" defaultValue={address?.phone} autoComplete="tel" />
        <div className="sm:col-span-2">
          <FormInput name="line1" label="Address line 1" defaultValue={address?.line1} autoComplete="address-line1" />
        </div>
        <div className="sm:col-span-2">
          <FormInput
            name="line2"
            label="Address line 2 — optional"
            defaultValue={address?.line2 ?? ""}
            required={false}
            autoComplete="address-line2"
          />
        </div>
        <FormInput name="city" label="City" defaultValue={address?.city} autoComplete="address-level2" />
        <FormInput name="state" label="State" defaultValue={address?.state} autoComplete="address-level1" />
        <FormInput name="postalCode" label="PIN code" defaultValue={address?.postalCode} autoComplete="postal-code" />
        <FormInput name="country" label="Country" defaultValue={address?.country ?? "India"} autoComplete="country-name" />
      </div>

      {!editing && (
        <label className="mt-4 flex items-center gap-2.5 text-sm text-walnut/80">
          <input type="checkbox" name="makeDefault" className="h-[18px] w-[18px] text-burgundy focus:ring-burgundy" />
          Make this my default address
        </label>
      )}

      {state?.error && <p className="mt-3 text-sm text-burgundy">{state.error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition hover:bg-burgundy disabled:opacity-50"
        >
          {pending ? "Saving…" : editing ? "Save changes" : "Save address"}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-walnut/60 hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}

function FormInput({
  name,
  label,
  defaultValue,
  required = true,
  autoComplete,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-walnut/70">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy"
      />
    </label>
  );
}

function AddressCard({ address }: { address: SavedAddress }) {
  const [editing, setEditing] = useState(false);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAddressAction, initial);
  const [defaultState, defaultAction, defaultPending] = useActionState(setDefaultAddressAction, initial);

  if (editing) {
    return <AddressForm address={address} onDone={() => setEditing(false)} />;
  }

  return (
    <li className="rounded-2xl border border-gold/25 bg-white/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-medium text-ink">
            {address.label || address.name}
            {address.isDefault && (
              <span className="rounded-full bg-burgundy/10 px-2.5 py-0.5 text-xs font-medium text-burgundy">
                Default
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-walnut/75">
            {address.label ? `${address.name} · ` : ""}
            {[address.line1, address.line2, `${address.city}, ${address.state}`, address.postalCode, address.country]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="mt-0.5 text-sm text-walnut/60">{address.phone}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        {!address.isDefault && (
          <form action={defaultAction}>
            <input type="hidden" name="addressId" value={address.id} />
            <button type="submit" disabled={defaultPending} className="font-medium text-burgundy hover:underline disabled:opacity-50">
              Set as default
            </button>
          </form>
        )}
        <button type="button" onClick={() => setEditing(true)} className="font-medium text-ink hover:underline">
          Edit
        </button>
        <form action={deleteAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <button type="submit" disabled={deletePending} className="font-medium text-walnut/60 hover:text-burgundy disabled:opacity-50">
            Remove
          </button>
        </form>
      </div>
      {(deleteState?.error || defaultState?.error) && (
        <p className="mt-2 text-xs text-burgundy">{deleteState?.error ?? defaultState?.error}</p>
      )}
    </li>
  );
}

export default function SavedAddresses({ addresses }: { addresses: SavedAddress[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-ink">Saved Addresses</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-ivory"
          >
            Add address
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-walnut/70">
        Save an address once and pick it at checkout — no retyping next time.
      </p>

      <div className="mt-6 space-y-4">
        {adding && <AddressForm onDone={() => setAdding(false)} />}

        {addresses.length === 0 && !adding ? (
          <p className="rounded-2xl border border-gold/20 bg-white/40 p-6 text-center text-walnut/70">
            No saved addresses yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {addresses.map((a) => (
              <AddressCard key={a.id} address={a} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
