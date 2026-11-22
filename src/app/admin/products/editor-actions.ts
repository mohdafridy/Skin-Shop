"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import type { ProductDetails } from "@/lib/storefront-catalog";

export type EditorState = { error?: string; fieldErrors?: Record<string, string> } | null;

const schema = z.object({
  id: z.string(),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(160),
  shortName: z.string().trim().max(160),
  category: z.string().trim().min(2).max(100),
  collection: z.enum(["Skin","Hair","Body","Kids","Lip Care"]),
  price: z.coerce.number().int().min(0).max(10000000),
  image: z.string().trim().min(1).max(1500),
  stock: z.string().trim().refine((v) => v === "" || (/^\d+$/.test(v) && Number.isSafeInteger(Number(v))), "Enter a whole number."),
  tagline: z.string().trim().max(220),
  shortDescription: z.string().trim().min(10).max(1200),
  description: z.string().trim().min(10).max(10000),
  size: z.string().trim().max(100),
  suitableFor: z.string().trim().max(220),
  gallery: z.string().trim().max(10000),
  ingredients: z.string().trim().max(5000),
  benefits: z.string().trim().max(5000),
  ritual: z.string().trim().max(5000),
  related: z.string().trim().max(3000),
  ritualTags: z.string().trim().max(300),
});

function lines(value: string) { return value.split(/\r?\n/).map((v)=>v.trim()).filter(Boolean); }
function photoValid(url:string) {
  if (url.startsWith("/images/")) return !url.includes("..") && !url.includes("//");
  try { const u = new URL(url); return u.protocol === "https:" && !u.username && !u.password; }
  catch { return false; }
}
const validTags = new Set(["Cleanse","Treat","Hydrate","Exfoliate","Hair","Body","Family Care"]);

export async function saveProductAction(_previous: EditorState, form: FormData): Promise<EditorState> {
  await requireAdminSession();
  const fields = ["id","slug","name","shortName","category","collection","price","image","stock","tagline",
    "shortDescription","description","size","suitableFor","gallery","ingredients","benefits","ritual",
    "related","ritualTags"] as const;
  const raw = Object.fromEntries(fields.map((key)=>[key, String(form.get(key) ?? "")]));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string,string> = {};
    for (const issue of parsed.error.issues) {
      const key=String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key]=issue.message;
    }
    return {error:"Please check the highlighted fields.",fieldErrors};
  }
  const value=parsed.data;
  const gallery=[value.image,...lines(value.gallery).filter((v)=>v!==value.image)];
  if (!gallery.every(photoValid)) {
    return {error:"Use a /images/ path or an HTTPS image URL.",fieldErrors:{image:"Invalid image URL."}};
  }
  const tags=lines(value.ritualTags.replace(/,/g,"\n"));
  if (tags.some((v)=>!validTags.has(v))) {
    return {error:"Unrecognized ritual tag.",fieldErrors:{ritualTags:"Use Cleanse, Treat, Hydrate, Exfoliate, Hair, Body, Family Care."}};
  }

  const details: ProductDetails = {
    tagline:value.tagline,
    shortDescription:value.shortDescription,
    description:value.description,
    size:value.size,
    suitableFor:value.suitableFor,
    gallery,
    ingredients:lines(value.ingredients),
    benefits:lines(value.benefits),
    ritual:lines(value.ritual),
    related:lines(value.related.replace(/,/g,"\n")),
    ritualTags:tags as ProductDetails["ritualTags"],
    featured:form.get("featured")==="on",
    bestseller:form.get("bestseller")==="on",
  };
  const updates = {
    name:value.name, shortName:value.shortName||null, category:value.category,
    collection:value.collection, price:value.price, currency:"INR", image:value.image,
    stock:value.stock===""?null:Number(value.stock),
    active:form.get("active")==="on",
    details:details as Prisma.InputJsonValue,
  };

  let savedSlug=value.slug;
  try {
    if (value.id) {
      const previous=await prisma.product.findUnique({where:{id:value.id},select:{slug:true}});
      if (!previous) return {error:"Product not found."};
      savedSlug=previous.slug; // Never rename URLs of previously purchased or bundled items.
      await prisma.product.update({where:{id:value.id},data:updates});
    } else {
      await prisma.product.create({data:{slug:value.slug,...updates}});
    }
  } catch (error) {
    console.error("admin_product_save_failed",error);
    const code=(error as {code?:string}).code;
    if (code==="P2002") return {error:"This product URL already exists.",fieldErrors:{slug:"Choose another slug."}};
    if (code==="P2022") return {error:"Apply the included additive Prisma migration before saving."};
    return {error:"Unable to save the product. Please retry."};
  }
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/sitemap.xml");
  revalidatePath("/products/"+savedSlug);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
