"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState, type ChangeEvent } from "react";
import type { Product } from "@/data/products";
import { newBadgeDaysRemaining, newBadgeExpiry, type NewBadgeSettings } from "@/lib/new-arrival";
import NewArrivalBadge from "@/components/NewArrivalBadge";
import { saveProductAction, type EditorState } from "./editor-actions";

const emptyState: EditorState = null;
const inputStyle = "mt-1.5 block w-full rounded-xl border border-gold/35 bg-white/85 px-4 py-3 text-sm text-ink outline-none transition focus:border-burgundy focus:ring-2 focus:ring-burgundy/15";
const panelStyle = "rounded-2xl border border-gold/25 bg-white/55 p-5 sm:p-7";
const sectionTitle = "mb-1 font-display text-[1.7rem] text-ink";
const helpStyle = "text-sm leading-relaxed text-walnut/65";

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 95);
}

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return <span className="block text-sm font-semibold text-ink">
    {children}{required && <span className="ml-1 text-burgundy">*</span>}
  </span>;
}

export default function ProductEditorForm({
  product, recordId, newBadgeSettings, productChoices = [],
}: {
  product?: Product;
  recordId?: string;
  newBadgeSettings?: NewBadgeSettings;
  productChoices?: { slug: string; name: string; category: string }[];
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, emptyState);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [photo, setPhoto] = useState(product?.image ?? "");
  const [galleryUrls, setGalleryUrls] = useState(
    (product?.gallery ?? []).filter((url) => url !== product?.image).join("\n"),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [badgeDuration, setBadgeDuration] = useState<"off" | "30" | "60" | "90">(
    newBadgeSettings ? String(newBadgeSettings.durationDays) as "30" | "60" | "90" : product ? "off" : "30",
  );
  const [restartBadge, setRestartBadge] = useState(false);

  const remainingDays = newBadgeSettings ? newBadgeDaysRemaining(newBadgeSettings) : 0;
  const oldExpiry = newBadgeSettings ? newBadgeExpiry(newBadgeSettings) : null;
  const samePeriod = Boolean(newBadgeSettings && newBadgeSettings.durationDays === Number(badgeDuration));
  const previewUntil = "2099-01-01T00:00:00.000Z";

  const fieldError = (key: string) => state?.fieldErrors?.[key]
    ? <p role="alert" className="mt-1.5 text-xs text-burgundy">{state.fieldErrors[key]}</p>
    : null;

  async function sendImage(file: File): Promise<string> {
    if (file.size > 5 * 1024 * 1024) throw new Error("Each image must be 5 MB or smaller.");
    const payload = new FormData();
    payload.set("file", file);
    const response = await fetch("/admin/products/upload", { method: "POST", body: payload });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.url) throw new Error(result?.message || "The photo could not be uploaded.");
    return result.url;
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>, kind: "primary" | "gallery") {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      if (kind === "primary") {
        setPhoto(await sendImage(files[0]));
        setUploadMessage("Main photo uploaded and ready to save.");
      } else {
        const urls: string[] = [];
        for (const file of files.slice(0, 8)) urls.push(await sendImage(file));
        setGalleryUrls((current) => [current.trim(), ...urls].filter(Boolean).join("\n"));
        setUploadMessage(String(urls.length) + " gallery photo(s) uploaded and ready to save.");
      }
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={recordId ?? ""} />
      <input type="hidden" name="currency" value="INR" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/25 bg-sand/30 p-4 text-sm">
        <span className="text-walnut/80">Only fields marked * are required. Everything here can be managed without code.</span>
        <span className="font-semibold text-burgundy">Changes go straight to your shop</span>
      </div>
      {state?.error && <div role="alert" className="rounded-xl border border-burgundy/25 bg-burgundy/5 p-4 text-sm text-burgundy">
        {state.error}
      </div>}

      <section className={panelStyle} aria-labelledby="product-basics-title">
        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.17em] text-burgundy">01 / The essentials</p>
        <h2 id="product-basics-title" className={sectionTitle}>Product information</h2>
        <p className={helpStyle}>What shoppers see, and what they pay at checkout.</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2"><FieldLabel required>Product name</FieldLabel>
            <input name="name" required maxLength={160} value={name} onChange={(e) => {
              const value = e.target.value;
              setName(value);
              if (!product && !slugTouched) setSlug(slugify(value));
            }} className={inputStyle} placeholder="e.g. Botanical Rose Serum" />
            {fieldError("name")}
          </label>
          <label><FieldLabel required>Product link</FieldLabel>
            <input name="slug" required value={slug} readOnly={Boolean(product)}
              onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
              className={inputStyle + (product ? " bg-sand/35 text-walnut/60" : "")} />
            <span className="mt-1.5 block text-xs text-walnut/55">
              {product ? "Locked to protect existing product links." : "Created from the name. You can customize it now."}
            </span>
            {fieldError("slug")}
          </label>
          <label><FieldLabel>Short name (optional)</FieldLabel>
            <input name="shortName" maxLength={160} defaultValue={product?.shortName ?? ""} className={inputStyle} />
          </label>
          <label><FieldLabel required>Category</FieldLabel>
            <input name="category" required list="admin-product-categories" defaultValue={product?.category ?? ""}
              placeholder="e.g. Face Serum" className={inputStyle} />
            <datalist id="admin-product-categories">
              {Array.from(new Set(productChoices.map((p) => p.category))).sort()
                .map((category) => <option key={category} value={category} />)}
            </datalist>
            {fieldError("category")}
          </label>
          <label><FieldLabel required>Collection</FieldLabel>
            <select name="collection" defaultValue={product?.collection ?? "Skin"} className={inputStyle}>
              {["Skin", "Hair", "Body", "Kids", "Lip Care"].map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label><FieldLabel required>Price (₹)</FieldLabel>
            <input name="price" required type="number" min={0} step={1} defaultValue={product?.price ?? ""} className={inputStyle} />
            {fieldError("price")}
          </label>
          <label><FieldLabel>Available quantity</FieldLabel>
            <input name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? ""} placeholder="Unlimited" className={inputStyle} />
            <span className="mt-1.5 block text-xs text-walnut/60">Blank = unlimited · 0 = sold out</span>
            {fieldError("stock")}
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-gold/25 bg-sand/20 p-4 text-sm text-ink">
            <input type="checkbox" name="active" defaultChecked={product?.active !== false}
              className="h-4 w-4 accent-burgundy" />
            <span><strong className="block font-semibold">Published</strong>
              <span className="text-xs text-walnut/60">Visible and available to purchase</span>
            </span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-gold/25 bg-sand/20 p-4 text-sm text-ink">
            <input type="checkbox" name="featured" defaultChecked={Boolean(product?.featured)}
              className="h-4 w-4 accent-burgundy" />
            <span className="font-medium">Featured product</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-gold/25 bg-sand/20 p-4 text-sm text-ink">
            <input type="checkbox" name="bestseller" defaultChecked={Boolean(product?.bestseller)}
              className="h-4 w-4 accent-burgundy" />
            <span className="font-medium">Bestseller</span>
          </label>
        </div>
      </section>

      <section className={panelStyle} aria-labelledby="product-new-title">
        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.17em] text-burgundy">02 / Launch highlight</p>
        <h2 id="product-new-title" className={sectionTitle}>New arrival badge</h2>
        <p className={helpStyle}>
          Add a refined animated <strong>NEW</strong> label to your product. It removes itself after the period you choose — no reminders or manual changes.
        </p>
        <fieldset className="mt-5">
          <legend className="sr-only">How long should the NEW badge appear?</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              ["off", "No badge", "Keep it hidden"],
              ["30", "30 days", "One month"],
              ["60", "60 days", "Two months"],
              ["90", "90 days", "Three months"],
            ] as const).map(([value, label, description]) => (
              <label key={value} className={"cursor-pointer rounded-xl border p-4 transition-colors " +
                (badgeDuration === value
                  ? "border-burgundy bg-burgundy/[0.045] ring-1 ring-burgundy/25"
                  : "border-gold/25 bg-ivory/60 hover:border-gold/70")}>
                <input name="newBadgeDuration" type="radio" value={value} checked={badgeDuration === value}
                  onChange={() => { setBadgeDuration(value); setRestartBadge(false); }}
                  className="mb-3 h-4 w-4 accent-burgundy" />
                <span className="block text-sm font-semibold text-ink">{label}</span>
                <span className="mt-1 block text-xs text-walnut/60">{description}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {badgeDuration !== "off" ? (
          <div className="mt-5 flex flex-wrap items-center gap-5 rounded-xl border border-gold/25 bg-sand/20 p-4">
            <div className="flex items-center gap-3">
              <NewArrivalBadge until={previewUntil} placement="inline" />
              <span className="text-xs text-walnut/65">Live preview</span>
            </div>
            <p className="min-w-0 flex-1 text-sm text-walnut/75">
              {oldExpiry && samePeriod && !restartBadge
                ? remainingDays > 0
                  ? "Already running: " + remainingDays + " day(s) left. Ends " + new Date(oldExpiry).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + "."
                  : "This badge has expired. Choose Restart below to show it again."
                : "A fresh " + badgeDuration + "-day countdown starts when you save."}
            </p>
          </div>
        ) : <p className="mt-4 text-sm text-walnut/60">The product will display without a NEW label.</p>}
        {newBadgeSettings && badgeDuration !== "off" && (
          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input type="checkbox" name="restartNewBadge" checked={restartBadge}
              onChange={(e) => setRestartBadge(e.target.checked)} className="mt-1 h-4 w-4 accent-burgundy" />
            <span><span className="block text-sm font-semibold text-ink">Restart countdown today</span>
              <span className="block text-xs leading-relaxed text-walnut/65">
                Only tick this when relaunching the product. Editing a price will not restart an existing badge.
              </span>
            </span>
          </label>
        )}
      </section>

      <section className={panelStyle} aria-labelledby="product-photos-title">
        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.17em] text-burgundy">03 / Photography</p>
        <h2 id="product-photos-title" className={sectionTitle}>Photos</h2>
        <p className={helpStyle}>Upload product images yourself. Their links are added automatically.</p>
        <div className="mt-5 grid gap-6 sm:grid-cols-[180px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gold/20 bg-sand">
            {photo ? <Image src={photo} alt="Product photo preview" fill sizes="180px"
              unoptimized={photo.startsWith("https://")} className="object-cover" /> :
              <div className="flex h-full items-center justify-center text-xs text-walnut/55">Photo preview</div>}
          </div>
          <div className="space-y-4">
            <label className="block"><FieldLabel required>Main image URL</FieldLabel>
              <input name="image" required value={photo} onChange={(e) => setPhoto(e.target.value)}
                placeholder="/images/products/photo.jpg or HTTPS image URL" className={inputStyle} />
              {fieldError("image")}
            </label>
            <label className="block"><FieldLabel>Upload main image</FieldLabel>
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading}
                onChange={(e) => void handleUpload(e, "primary")} className="mt-2 block w-full text-xs text-walnut/75" />
              <span className="mt-1.5 block text-xs text-walnut/60">JPEG, PNG or WebP, up to 5 MB per photo.</span>
            </label>
          </div>
        </div>
        <div className="mt-6 border-t border-gold/20 pt-5">
          <label className="block"><FieldLabel>Extra gallery images (optional)</FieldLabel>
            <textarea name="gallery" rows={2} value={galleryUrls}
              onChange={(e) => setGalleryUrls(e.target.value)} className={inputStyle}
              placeholder="Paste one image URL per line, or upload photos below" />
            {fieldError("gallery")}
          </label>
          <label className="mt-4 block"><FieldLabel>Upload gallery photos</FieldLabel>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={uploading}
              onChange={(e) => void handleUpload(e, "gallery")} className="mt-2 block w-full text-xs text-walnut/75" />
            <span className="mt-1.5 block text-xs text-walnut/60">Choose up to 8 images at a time.</span>
          </label>
          {uploading && <p role="status" className="mt-3 text-sm text-walnut/65">Uploading photos…</p>}
          {uploadMessage && <p role="status" className="mt-3 text-sm text-burgundy">{uploadMessage}</p>}
        </div>
      </section>

      <section className={panelStyle} aria-labelledby="product-story-title">
        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.17em] text-burgundy">04 / Product story</p>
        <h2 id="product-story-title" className={sectionTitle}>Descriptions</h2>
        <p className={helpStyle}>Explain what makes the product special.</p>
        <div className="mt-5 space-y-5">
          <label className="block"><FieldLabel required>Short description</FieldLabel>
            <textarea name="shortDescription" required rows={3}
              defaultValue={product?.shortDescription ?? ""} className={inputStyle}
              placeholder="One or two sentences about the product" />
            {fieldError("shortDescription")}
          </label>
          <label className="block"><FieldLabel required>Full product description</FieldLabel>
            <textarea name="description" required rows={5}
              defaultValue={product?.description ?? ""} className={inputStyle}
              placeholder="Tell customers what it does and why they'll love it" />
            {fieldError("description")}
          </label>
          <details className="rounded-xl border border-gold/25 bg-sand/20 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-burgundy">
              More details <span className="ml-2 font-normal text-walnut/60">(optional)</span>
            </summary>
            <div className="mt-5 space-y-5">
              <label className="block"><FieldLabel>Tagline</FieldLabel>
                <input name="tagline" defaultValue={product?.tagline ?? ""} className={inputStyle} />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label><FieldLabel>Size (e.g. 50 ml)</FieldLabel>
                  <input name="size" defaultValue={product?.size ?? ""} className={inputStyle} />
                </label>
                <label><FieldLabel>Suitable for</FieldLabel>
                  <input name="suitableFor" defaultValue={product?.suitableFor ?? ""} className={inputStyle} />
                </label>
              </div>
              {([
                ["ingredients", "Ingredients · one per line", product?.ingredients],
                ["benefits", "Benefits · one per line", product?.benefits],
                ["ritual", "How to use · one step per line", product?.ritual],
              ] as const).map(([key, label, values]) => (
                <label key={key} className="block">
                  <FieldLabel>{label}</FieldLabel>
                  <textarea name={key} rows={3} defaultValue={values?.join("\n") ?? ""} className={inputStyle} />
                  {fieldError(key)}
                </label>
              ))}
              <fieldset>
                <legend className="text-sm font-semibold text-ink">Ritual tags</legend>
                <p className="mt-1 text-xs text-walnut/65">Tick the skincare routines this product belongs to.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["Cleanse", "Treat", "Hydrate", "Exfoliate", "Hair", "Body", "Family Care"] as const)
                    .map((tag) => (
                      <label key={tag} className="flex items-center gap-2 rounded-lg border border-gold/30 bg-white/70 px-3 py-2 text-xs text-ink">
                        <input type="checkbox" name="ritualTags" value={tag} defaultChecked={product?.ritualTags?.includes(tag)}
                          className="h-3.5 w-3.5 accent-burgundy" />
                        {tag}
                      </label>
                    ))}
                </div>
                {fieldError("ritualTags")}
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold text-ink">Related products</legend>
                <p className="mt-1 text-xs text-walnut/65">Choose products to suggest under this product. No URL or code needed.</p>
                <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-gold/25 bg-white/60 p-3 sm:grid-cols-2">
                  {productChoices.filter((choice) => choice.slug !== product?.slug).map((choice) => (
                    <label key={choice.slug} className="flex cursor-pointer items-start gap-2 rounded-lg p-2 text-xs text-ink hover:bg-sand/40">
                      <input type="checkbox" name="related" value={choice.slug}
                        defaultChecked={product?.related?.includes(choice.slug)}
                        className="mt-0.5 h-3.5 w-3.5 accent-burgundy" />
                      <span>{choice.name}</span>
                    </label>
                  ))}
                  {productChoices.length === 0 && <p className="text-xs text-walnut/60">No related products available yet.</p>}
                </div>
                {fieldError("related")}
              </fieldset>
            </div>
          </details>
        </div>
      </section>

      <div className="sticky bottom-0 z-20 -mx-2 flex flex-wrap items-center justify-between gap-3 border-t border-gold/25 bg-ivory/95 px-4 py-4 shadow-[0_-10px_30px_rgba(32,29,26,0.06)] backdrop-blur-md">
        <span className="hidden text-xs text-walnut/60 sm:inline">Save to update the storefront and checkout.</span>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/products" className="rounded-full border border-gold/40 px-5 py-3 text-sm text-ink hover:border-burgundy">Cancel</Link>
          <button type="submit" disabled={pending || uploading}
            className="rounded-full bg-burgundy px-6 py-3 text-sm font-semibold text-ivory shadow-sm hover:bg-burgundy-dark disabled:opacity-50">
            {pending ? "Saving…" : product ? "Save product" : "Create product"}
          </button>
        </div>
      </div>
    </form>
  );
}
