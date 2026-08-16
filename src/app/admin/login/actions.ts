"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminConfigured, loginWithAdminKey } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export type AdminLoginState = { error: string } | null;

const ADMIN_LOGIN_LIMIT = 5;
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  if (!isAdminConfigured()) {
    return { error: "The admin dashboard isn't connected yet. Set ADMIN_API_KEY to enable it." };
  }

  const ip = getClientIp(await headers());
  const { allowed } = await checkRateLimit(`admin-login:${ip}`, ADMIN_LOGIN_LIMIT, ADMIN_LOGIN_WINDOW_MS);
  if (!allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const key = String(formData.get("key") ?? "");
  const ok = await loginWithAdminKey(key);
  if (!ok) return { error: "That key isn't correct." };

  redirect("/admin");
}
