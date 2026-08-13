"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.refresh();
      }}
      className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-ivory disabled:opacity-50"
    >
      {busy ? "Signing out…" : "Sign Out"}
    </button>
  );
}
