import type { Metadata, Viewport } from "next";
import AdminPwaRegister from "./AdminPwaRegister";

/**
 * Admin section layout. Its only job beyond rendering the pages is to make
 * /admin installable as a home-screen app (PWA): it links an admin-scoped
 * web manifest and declares the iOS standalone app meta, so the owner can
 * "Add to Home Screen" / "Install" and open the dashboard full-screen like
 * a native app. Scoped here so the storefront is never affected. Auth stays
 * where it already is — each admin page calls requireAdminSession() itself.
 */
export const metadata: Metadata = {
  applicationName: "Shop Admin",
  manifest: "/admin.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Shop Admin",
    statusBarStyle: "default",
  },
  // Legacy alias: some older iOS Safari versions only honour this exact
  // meta name for full-screen standalone launch. Next emits the modern
  // `mobile-web-app-capable`; adding this keeps standalone working on every
  // iPhone as well as Android.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#7e2539",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AdminPwaRegister />
    </>
  );
}
