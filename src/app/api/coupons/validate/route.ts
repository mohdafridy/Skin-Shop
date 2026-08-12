import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateDiscount, couponIsUsable } from "@/lib/backend";

const schema = z.object({ code: z.string().trim().min(1).max(64), subtotal: z.number().int().nonnegative() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ valid: false, message: "Invalid request." }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data.code.toUpperCase() } });
    if (!coupon || !couponIsUsable(coupon, parsed.data.subtotal)) {
      return NextResponse.json({ valid: false, discount: 0, message: "That code isn't valid." });
    }
    return NextResponse.json({ valid: true, code: coupon.code, discount: calculateDiscount(coupon, parsed.data.subtotal) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { valid: false, message: "Coupons aren't available right now." },
      { status: 503 },
    );
  }
}
