import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasValidAdminSession, isAdminConfigured } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await hasValidAdminSession()) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <p className="mb-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
        The Skin Shop
      </p>
      <h1 className="mb-8 text-center font-display text-3xl text-ink">Admin</h1>

      {isAdminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="rounded-2xl border border-gold/30 bg-sand/40 p-4 text-center text-sm text-walnut/80">
          The admin dashboard isn&apos;t connected yet. Set{" "}
          <code className="rounded bg-white/60 px-1 py-0.5 text-xs">ADMIN_API_KEY</code> to enable it.
        </p>
      )}
    </div>
  );
}
