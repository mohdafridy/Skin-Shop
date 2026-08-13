import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.string().trim().email().max(254) });

export async function POST(request: Request) {
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
