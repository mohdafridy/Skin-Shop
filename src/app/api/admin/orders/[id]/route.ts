import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/backend";

type Params = Promise<{ id: string }>;
const schema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "PAYMENT_FAILED"]),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  const order = await prisma.order.update({ where: { id }, data: { status: parsed.data.status }, include: { items: true } });
  return NextResponse.json({ order });
}
