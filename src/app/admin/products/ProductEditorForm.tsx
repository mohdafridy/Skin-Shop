"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState, type ChangeEvent } from "react";
import type { Product } from "@/data/products";
import { saveProductAction, type EditorState } from "./editor-actions";

const emptyState: EditorState = null;
const inputClass = "mt-1 w-full rounded-xl border border-gold/30 bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy/30";
const labelClass = "block text-sm font-medium text-ink";

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 95);
}

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return <span className={labelClass}>{children}{required && <span className="ml-1 text-burgundy">*</span>}</span>;
}

export default function ProductEditorForm({ product, recordId }: { product?: Product; recordId?: string }) {
  const [state, formAction, pending] = useActionState(saveProductAction, emptyState);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [photo, setPhoto] = useState(product?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Photos must be 5 MB or smaller.");
      return;
    }
    const payload = new FormData();
    payload.set("file", file);
    setUploading(true);
    setUploadError(null);
    try {
      const response = await fetch("/admin/products/upload", { method: "POST", body: payload });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.url) throw new Error(result?.message || "Upload failed.");
      setPhoto(result.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Photo upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const fieldError = (name: string) =>
    state?.fieldErrors?.[name]
      ? <p role="alert" className="mt-1 text-xs text-burgundy">{state.fieldErrors[name]}</p>
      : null;

  return (
    <form action={formAction} className="space-y-9">
      <input type="hidden" name="id" value={recordId ?? ""} />
      <input type="hidden" name="currency" value="INR" />
      {state?.error && (
        <div role="alert" className="rounded-xl border border-burgundy/30 bg-burgundy/5 p-4 text-sm text-burgundy">{state.error}</div>
      )}

      <section className="rounded-2xl border border-gold/25 bg-white/50 p-6">
        <h2 className="mb-5 font-display text-2xl text-ink">Product information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2"><FieldLabel required>Product name</FieldLabel>
            <input required name="name" value={name} onChange={(e) => {
              const v = e.target.value;
              setName(v);
              if (!product && !slugTouched) setSlug(slugify(v));
            }} maxLength={160} className={inputClass} />
            {fieldError("name")}
          </label>
          <label><FieldLabel required>Product URL / slug</FieldLabel>
            <input required name="slug" value={slug} readOnly={Boolean(product)} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} className={inputClass + (product ? " opacity-60" : "")} />
            <span className="mt-1 block text-xs text-walnut/60">{product ? "Locked to preserve existing links and orders." : "Used in your product URL; it must be unique."}</span>
            {fieldError("slug")}
          </label>
          <label><FieldLabel>Short name</FieldLabel>
            <input name="shortName" defaultValue={product?.shortName ?? ""} maxLength={160} className={inputClass} />
            {fieldError("shortName")}
          </label>
          <label><FieldLabel required>Category</FieldLabel>
            <input required name="category" defaultValue={product?.category ?? ""} placeholder="Face Serum" className={inputClass} />
            {fieldError("category")}
          </label>
          <label><FieldLabel required>Collection</FieldLabel>
            <select name="collection" defaultValue={product?.collection ?? "Skin"} className={inputClass}>
              {["Skin", "Hair", "Body", "Kids", "Lip Care"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label><FieldLabel required>Price (₹)</FieldLabel>
            <input required type="number" min={0} step={1} name="price" defaultValue={product?.price ?? ""} className={inputClass} />
            {fieldError("price")}
          </label>
          <label><FieldLabel>Available stock</FieldLabel>
            <input type="number" min={0} step={1} name="stock" defaultValue={product?.stock ?? ""} placeholder="Unlimited" className={inputClass} />
            <span className="mt-1 block text-xs text-walnut/60">Leave blank for unlimited. 0 means sold out.</span>
            {fieldError("stock")}
          </label>
          <label className="flex items-center gap-3 text-sm text-ink">
            <input type="checkbox" name="active" defaultChecked={product ? product.active !== false : true} className="h-4 w-4 accent-burgundy" />
            Published / available for sale
          </label>
          <label className="flex items-center gap-3 text-sm text-ink">
            <input type="checkbox" name="featured" defaultChecked={Boolean(product?.featured)} className="h-4 w-4 accent-burgundy" />
            Featured product
          </label>
          <label className="flex items-center gap-3 text-sm text-ink">
            <input type="checkbox" name="bestseller" defaultChecked={Boolean(product?.bestseller)} className="h-4 w-4 accent-burgundy" />
            Bestseller
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gold/25 bg-white/50 p-6">
        <h2 className="mb-5 font-display text-2xl text-ink">Photos</h2>
        {photo && (
          <div className="relative mb-4 h-48 w-48 overflow-hidden rounded-xl bg-sand">
            <Image src={photo} alt="Current product photograph" fill sizes="192px" unoptimized={photo.startsWith("https://")} className="object-cover" />
          </div>
        )}
        <label><FieldLabel required>Primary photo URL</FieldLabel>
          <input required name="image" value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="/images/products/photo.jpg or HTTPS URL" className={inputClass} />
          {fieldError("image")}
        </label>
        <label className="mt-4 block"><FieldLabel>Upload a photo</FieldLabel>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={uploading} className="mt-2 block w-full text-sm" />
          <span className="mt-1 block text-xs text-walnut/60">JPEG, PNG or WebP, up to 5 MB. Requires a Vercel Blob store connected to this project.</span>
        </label>
        {uploading && <p role="status" className="mt-2 text-sm text-walnut/75">Uploading photo…</p>}
        {uploadError && <p role="alert" className="mt-2 text-sm text-burgundy">{uploadError}</p>}
        <label className="mt-5 block"><FieldLabel>Gallery photo URLs (one per line)</FieldLabel>
          <textarea name="gallery" rows={3} defaultValue={product?.gallery?.join("\n") ?? ""} placeholder="Leave blank to use only the primary photo" className={inputClass} />
          {fieldError("gallery")}
        </label>
      </section>

      <section className="rounded-2xl border border-gold/25 bg-white/50 p-6">
        <h2 className="mb-5 font-display text-2xl text-ink">Descriptions &amp; details</h2>
        <div className="space-y-5">
          <label className="block"><FieldLabel>Tagline</FieldLabel>
            <input name="tagline" defaultValue={product?.tagline ?? ""} className={inputClass} />
          </label>
          <label className="block"><FieldLabel required>Short description</FieldLabel>
            <textarea required name="shortDescription" rows={3} defaultValue={product?.shortDescription ?? ""} className={inputClass} />
            {fieldError("shortDescription")}
          </label>
          <label className="block"><FieldLabel required>Full description</FieldLabel>
            <textarea required name="description" rows={6} defaultValue={product?.description ?? ""} className={inputClass} />
            {fieldError("description")}
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label><FieldLabel>Size (e.g. 50 ml)</FieldLabel>
              <input name="size" defaultValue={product?.size ?? ""} className={inputClass} />
            </label>
            <label><FieldLabel>Suitable for</FieldLabel>
              <input name="suitableFor" defaultValue={product?.suitableFor ?? ""} className={inputClass} />
            </label>
          </div>
          {([
            ["ingredients", "Ingredients (one per line)", product?.ingredients],
            ["benefits", "Benefits (one per line)", product?.benefits],
            ["ritual", "How to use (one step per line)", product?.ritual],
            ["related", "Related product slugs (one per line)", product?.related],
            ["ritualTags", "Ritual tags (one per line)", product?.ritualTags],
          ] as const).map(([key, label, values]) => (
            <label key={key} className="block"><FieldLabel>{label}</FieldLabel>
              <textarea name={key} rows={3} defaultValue={values?.join("\n") ?? ""} className={inputClass} />
              {fieldError(key)}
            </label>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-gold/30 bg-ivory/95 p-4 backdrop-blur-sm">
        <Link href="/admin/products" className="rounded-full border border-gold/40 px-6 py-3 text-sm text-ink">Cancel</Link>
        <button type="submit" disabled={pending || uploading} className="rounded-full bg-burgundy px-7 py-3 text-sm font-semibold text-ivory disabled:opacity-50">
          {pending ? "Saving product…" : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
