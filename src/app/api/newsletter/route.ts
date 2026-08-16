import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().trim().email().max(254) });

const NEWSLETTER_LIMIT = 10;
const NEWSLETTER_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const { allowed } = await checkRateLimit(`newsletter:${ip}`, NEWSLETTER_LIMIT, NEWSLETTER_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const email = parsed.data.email.trim().toLowerCase();
    await prisma.newsletterSubscriber.upsert({ where: { email }, update: { active: true }, create: { email } });
    return NextResponse.json({ ok: true, message: "You're on the list." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Signups aren't available right now — please try again later." },
      { status: 503 },
    );
  }
}
