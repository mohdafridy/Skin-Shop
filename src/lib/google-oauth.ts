import { z } from "zod";
import { siteUrl } from "@/lib/notifications/templates";

/**
 * "Sign in with Google" for customer accounts.
 *
 * Inert until GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set — the button
 * stays hidden and the routes report "unavailable" — so shipping this without
 * credentials changes nothing for shoppers. The client secret is used only in
 * the server-side token exchange and never reaches the browser.
 *
 * Identity is the customer's Google-verified email: the callback requires
 * email_verified before trusting it. No new database column is needed —
 * accounts are matched (or created) by that email.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** Must match a redirect URI registered on the Google OAuth client exactly.
 * Derived from the canonical site URL, so set SITE_URL to the production
 * domain and register `<that>/api/auth/google/callback` in Google Console. */
export function googleRedirectUri(): string {
  return `${siteUrl()}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    // Let the customer pick which Google account to use rather than silently
    // reusing whatever they're already signed into.
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

type GoogleTokens = { access_token: string; id_token?: string };

export async function exchangeGoogleCode(code: string): Promise<GoogleTokens | null> {
  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: googleRedirectUri(),
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as GoogleTokens | null;
    return data?.access_token ? data : null;
  } catch {
    return null;
  }
}

// Google returns email_verified as a real boolean on the v3 userinfo endpoint,
// but tolerate the string form some libraries surface.
const profileSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  email_verified: z.union([z.boolean(), z.literal("true"), z.literal("false")]).optional(),
  name: z.string().optional(),
});

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
};

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile | null> {
  try {
    const res = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const parsed = profileSchema.safeParse(await res.json().catch(() => null));
    if (!parsed.success) return null;
    const p = parsed.data;
    return {
      sub: p.sub,
      email: p.email.trim().toLowerCase(),
      emailVerified: p.email_verified === true || p.email_verified === "true",
      name: p.name?.trim() || null,
    };
  } catch {
    return null;
  }
}
