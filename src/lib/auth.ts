import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "./prisma";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
export const SESSION_COOKIE = "tss_session";
const SESSION_DAYS = 30;

/** scrypt via node:crypto — no third-party hashing dependency needed. Stored
 * as "saltHex:keyHex" so the salt travels with the hash. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const key = await scryptAsync(password, Buffer.from(saltHex, "hex"), KEY_LENGTH);
  const expected = Buffer.from(keyHex, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(200),
});

/** Creates a DB-backed session and sets the httpOnly cookie. Route Handlers
 * only — cookies can't be written during Server Component render. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { id: token, userId, expiresAt } });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  // Clear the cookie first and unconditionally — if the row delete fails the
  // shopper must still end up signed out on this device.
  store.delete(SESSION_COOKIE);
  if (token && process.env.DATABASE_URL) {
    await prisma.session.deleteMany({ where: { id: token } });
  }
}

export type CurrentUser = { id: string; email: string; name: string | null; phone: string | null };

/** Resolves the signed-in user, or null. Safe to call when no database is
 * configured yet — an unreachable DB means "not signed in", never a crash,
 * so guest browsing keeps working exactly as before. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { id: token },
      include: { user: { select: { id: true, email: true, name: true, phone: true } } },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
  } catch {
    return null;
  }
}
