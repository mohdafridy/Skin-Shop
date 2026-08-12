import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest, productSchema } from "@/lib/backend";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const parsed = productSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update.", details: parsed.error.flatten() }, { status: 400 });
  }
  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ product });
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const product = await prisma.product.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ product });
}
