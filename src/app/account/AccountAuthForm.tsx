"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Field from "@/components/Field";

type Mode = "login" | "register";

const GOOGLE_AUTH_MESSAGES: Record<string, string> = {
  google_failed: "Google sign-in didn't complete. Please try again.",
  google_unverified:
    "That Google account's email isn't verified, so we can't sign you in with it.",
  google_unavailable: "Google sign-in isn't available right now.",
};

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

export default function AccountAuthForm({
  accountsEnabled,
  googleEnabled = false,
}: {
  accountsEnabled: boolean;
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = GOOGLE_AUTH_MESSAGES[searchParams.get("auth") ?? ""] ?? null;
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
      {authError && (
        <p role="alert" className="mb-6 rounded-xl bg-burgundy/10 p-3 text-sm text-burgundy">
          {authError}
        </p>
      )}

      {googleEnabled && accountsEnabled && (
        <>
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gold/40 bg-white px-6 py-3 text-sm font-medium text-ink transition hover:border-burgundy hover:bg-sand/40"
          >
            <GoogleGlyph />
            Continue with Google
          </a>
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-gold/25" />
            <span className="text-xs uppercase tracking-[0.15em] text-walnut/50">or</span>
            <span className="h-px flex-1 bg-gold/25" />
          </div>
        </>
      )}

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
