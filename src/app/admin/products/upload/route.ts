import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { hasValidAdminSession } from "@/lib/admin-auth";
export const runtime = "nodejs";
const types: Record<string,string> = { "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp" };
export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) return NextResponse.json({ message:"Please sign in as an administrator." }, { status:401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ message:"Connect a public Vercel Blob store to enable photo uploads, or use an existing HTTPS image URL." }, {status:503});
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !(file.type in types) || file.size < 1 || file.size > 5*1024*1024) {
    return NextResponse.json({ message:"Upload a JPEG, PNG or WebP image up to 5 MB." }, {status:400});
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const signatureValid = file.type === "image/jpeg"
    ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : file.type === "image/png"
      ? bytes.slice(0,8).every((x,i)=> x === [137,80,78,71,13,10,26,10][i])
      : bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP";
  if (!signatureValid) return NextResponse.json({message:"The file does not match its image type."},{status:400});
  try {
    const blob = await put("products/" + randomUUID() + "." + types[file.type], Buffer.from(bytes), {
      access:"public", contentType:file.type, addRandomSuffix:false,
    });
    return NextResponse.json({url:blob.url});
  } catch (error) {
    console.error("product_image_upload_failed",error);
    return NextResponse.json({message:"Photo upload failed. Retry or use an image URL."},{status:502});
  }
}
