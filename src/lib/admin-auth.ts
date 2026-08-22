import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Session for the /admin dashboard. There's no staff-account system (see
 * the ADMIN_API_KEY comment in .env.example) — one shared key, same as the
 * raw x-admin-key API. This only adds a short-lived signed cookie so the
 * dashboard doesn't require re-entering that key on every request.
 *
 * Deliberately stateless (HMAC-signed payload, no DB row): the signature is
 * checked with the same ADMIN_API_KEY the raw API already trusts, so this
 * needs nothing beyond what's already required, and still works if the
 * database is briefly unreachable.
 *
 * Per Next.js's own guidance, this is NOT enforced via proxy/middleware —
 * every admin Server Action and page calls requireAdminSession() itself,
 * which is the actual authorization check.
 */

const ADMIN_SESSION_COOKIE = "tss_admin_session";
const SESSION_HOURS = 12;

function sign(payload: string): string {
  const secret = process.env.ADMIN_API_KEY;
  if (!secret) throw new Error("ADMIN_API_KEY is not set.");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_API_KEY);
}

/**
 * Checks a submitted key against ADMIN_API_KEY — the same comparison
 * src/lib/backend.ts#isAdminRequest uses for the raw API — and sets the
 * session cookie on success.
 */
export async function loginWithAdminKey(key: string): Promise<boolean> {
  // Trim both sides: a stray trailing newline/space on the stored env secret
  // (a common paste artefact in hosting dashboards) would otherwise make the
  // exact byte comparison fail even when the right key is typed. Whitespace-only
  // differences aren't a meaningful key, so trimming doesn't weaken the check.
  const expected = process.env.ADMIN_API_KEY?.trim();
  const provided = key.trim();
  if (!expected || !provided || !safeEqual(expected, provided)) return false;

  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expiresAt);
  const token = `${payload}.${sign(payload)}`;

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
  return true;
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}

export async function hasValidAdminSession(): Promise<boolean> {
  if (!isAdminConfigured()) return false;

  const store = await cookies();
  const raw = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw) return false;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }
  if (!safeEqual(expected, signature)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/** Call at the top of every protected /admin Server Component. Redirects
 * to the login page instead of rendering anything when the session is
 * missing or expired. */
export async function requireAdminSession(): Promise<void> {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }
}
