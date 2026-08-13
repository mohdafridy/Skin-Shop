"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Field from "@/components/Field";

type Mode = "login" | "register";

export default function AccountAuthForm({ accountsEnabled }: { accountsEnabled: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "register" ? { name, email, password } : { email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      // Server Component reads the new session cookie on refresh.
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 flex rounded-full border border-gold/30 p-1">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            aria-pressed={mode === m}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === m ? "bg-burgundy text-ivory" : "text-walnut/70 hover:text-ink"
            }`}
          >
            {m === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {!accountsEnabled && (
        <p className="mb-6 rounded-xl border border-gold/30 bg-sand/40 p-4 text-sm text-walnut/80">
          Accounts aren&apos;t connected yet, so signing in isn&apos;t available on this
          deployment. You can still shop and check out as a guest — no account needed.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {mode === "register" && (
          <Field label="Name" id="account-name" value={name} onChange={setName} autoComplete="name" />
        )}
        <Field
          label="Email"
          id="account-email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <Field
          label="Password"
          id="account-password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
        {mode === "register" && (
          <p className="text-xs text-walnut/60">At least 8 characters.</p>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-burgundy/10 p-3 text-sm text-burgundy">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !accountsEnabled}
          className="w-full rounded-full bg-burgundy px-7 py-3.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-walnut/70">
        Prefer not to sign up?{" "}
        <Link href="/shop" className="font-medium text-burgundy underline-offset-2 hover:underline">
          Shop as a guest
        </Link>
        .
      </p>
    </div>
  );
}
