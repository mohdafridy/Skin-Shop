"use client";

import { useEffect } from "react";

/**
 * Registers the admin service worker so the dashboard qualifies as an
 * installable app (Chrome/Android needs a fetch handler). The worker caches
 * nothing — admin data stays live. Failure is non-fatal: the admin works
 * exactly the same without it, just without the install prompt.
 */
export default function AdminPwaRegister() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw-admin.js").catch(() => {});
    }
  }, []);

  return null;
}
