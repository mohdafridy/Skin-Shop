import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { buildGoogleAuthUrl, isGoogleOAuthConfigured } from "@/lib/google-oauth";
import { siteUrl } from "@/lib/notifications/templates";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "g_oauth_state";
const NEXT_COOKIE = "g_oauth_next";

/** Only same-origin relative paths are safe redirect targets — guards against
 * an open redirect via ?next=. */
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
}

export async function GET(request: NextRequest) {
  const base = siteUrl();

  if (!process.env.DATABASE_URL || !isGoogleOAuthConfigured()) {
    return NextResponse.redirect(`${base}/account?auth=google_unavailable`);
  }

  const ip = getClientIp(request.headers);
  const { allowed } = await checkRateLimit(`oauth:${ip}`, 20, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.redirect(`${base}/account?auth=google_failed`);
  }

  const state = randomBytes(16).toString("hex");
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  const res = NextResponse.redirect(buildGoogleAuthUrl(state));
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 minutes to complete the round-trip.
  };
  // CSRF: the callback must see this exact state back from Google.
  res.cookies.set(STATE_COOKIE, state, cookieOpts);
  res.cookies.set(NEXT_COOKIE, next, cookieOpts);
  return res;
}
