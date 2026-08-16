import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, loginSchema, verifyPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "not_configured", message: "Accounts aren't connected yet." },
      { status: 503 },
    );
  }

  const ip = getClientIp(request.headers);
  const { allowed } = await checkRateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many attempts. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request", message: "Malformed request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", message: "Enter your email and password." },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Same message either way — never reveal whether an email is registered.
    const invalid = NextResponse.json(
      { error: "invalid_credentials", message: "That email and password don't match." },
      { status: 401 },
    );
    if (!user) return invalid;
    if (!(await verifyPassword(password, user.passwordHash))) return invalid;

    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "login_failed", message: "Couldn't sign you in. Please try again." },
      { status: 500 },
    );
  }
}
