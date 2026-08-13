"use server";

import { redirect } from "next/navigation";
import { isAdminConfigured, loginWithAdminKey } from "@/lib/admin-auth";

export type AdminLoginState = { error: string } | null;

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  if (!isAdminConfigured()) {
    return { error: "The admin dashboard isn't connected yet. Set ADMIN_API_KEY to enable it." };
  }

  const key = String(formData.get("key") ?? "");
  const ok = await loginWithAdminKey(key);
  if (!ok) return { error: "That key isn't correct." };

  redirect("/admin");
}
