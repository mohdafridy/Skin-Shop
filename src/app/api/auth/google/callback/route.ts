import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  createSessionRow,
  hashPassword,
  sessionCookieOptions,
} from "@/lib/auth";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  isGoogleOAuthConfigured,
} from "@/lib/google-oauth";
import { siteUrl } from "@/lib/notifications/templates";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "g_oauth_state";
const NEXT_COOKIE = "g_oauth_next";

export async function GET(request: NextRequest) {
  const base = siteUrl();

  const fail = (reason: string) => {
    const res = NextResponse.redirect(`${base}/account?auth=${reason}`);
    res.cookies.delete(STATE_COOKIE);
    res.cookies.delete(NEXT_COOKIE);
    return res;
  };

  if (!process.env.DATABASE_URL || !isGoogleOAuthConfigured()) return fail("google_unavailable");

  const params = request.nextUrl.searchParams;
  // The customer declined consent, or Google returned an error.
  if (params.get("error")) return fail("google_cancelled");

  const code = params.get("code");
  const state = params.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;
  // CSRF check: the state we set must come back unchanged.
  if (!code || !state || !cookieState || state !== cookieState) return fail("google_failed");

  try {
    const tokens = await exchangeGoogleCode(code);
    if (!tokens) return fail("google_failed");

    const profile = await fetchGoogleProfile(tokens.access_token);
    if (!profile) return fail("google_failed");
    // Never trust an unverified Google email — it's the whole basis of identity
    // here, so a spoofable one must not be able to claim an account.
    if (!profile.emailVerified) return fail("google_unverified");

    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      // A Google-only account. Store an unguessable random password hash so the
      // NOT NULL column is satisfied and password login can never match — the
      // customer signs in with Google, and their verified email is the identity.
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          passwordHash: await hashPassword(randomBytes(32).toString("hex")),
        },
      });
    } else if (!user.name && profile.name) {
      // Backfill a display name onto an existing email/password account.
      await prisma.user.update({ where: { id: user.id }, data: { name: profile.name } });
    }

    const { token, expiresAt } = await createSessionRow(user.id);
    const next = request.cookies.get(NEXT_COOKIE)?.value;
    const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

    const res = NextResponse.redirect(`${base}${dest}`);
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
    res.cookies.delete(STATE_COOKIE);
    res.cookies.delete(NEXT_COOKIE);
    return res;
  } catch (error) {
    console.error("google_oauth_callback_failed", error);
    return fail("google_failed");
  }
}
