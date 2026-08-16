import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/backend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const REVIEW_LIMIT = 5;
const REVIEW_WINDOW_MS = 15 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");

  if ((type !== "product" && type !== "combo") || !slug) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const where =
    type === "product"
      ? { status: "APPROVED" as const, product: { slug } }
      : { status: "APPROVED" as const, combo: { slug } };

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, rating: true, authorName: true, body: true, createdAt: true },
  });

  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : null;

  return NextResponse.json({ reviews, count, average });
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const { allowed } = await checkRateLimit(`review:${ip}`, REVIEW_LIMIT, REVIEW_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review.", details: parsed.error.flatten() }, { status: 400 });
  }
  const { type, slug, rating, authorName, authorEmail, body } = parsed.data;

  const subject =
    type === "product"
      ? await prisma.product.findUnique({ where: { slug }, select: { id: true } })
      : await prisma.combo.findUnique({ where: { slug }, select: { id: true } });

  if (!subject) {
    return NextResponse.json({ error: "That product or combo doesn't exist." }, { status: 404 });
  }

  await prisma.review.create({
    data: {
      type: type === "product" ? "PRODUCT" : "COMBO",
      productId: type === "product" ? subject.id : null,
      comboId: type === "combo" ? subject.id : null,
      rating,
      authorName,
      authorEmail: authorEmail || null,
      body,
    },
  });

  return NextResponse.json(
    { message: "Thanks — your review has been submitted and will appear once it's approved." },
    { status: 201 },
  );
}
