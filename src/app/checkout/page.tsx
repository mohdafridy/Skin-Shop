import { Suspense } from "react";
import type { Metadata } from "next";
import { isActiveProviderConfigured } from "@/lib/payment/server";
import { isUpiDirectEnabled } from "@/data/payment";
import { getCurrentUser } from "@/lib/auth";
import { listUserAddresses } from "@/lib/addresses";
import CheckoutClient from "./CheckoutClient";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Guest checkout for The Skin Shop — no account required.",
  robots: noIndex,
};

// Reads the session cookie (getCurrentUser) to offer saved addresses, so this
// must render per-request.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const savedAddresses = user ? await listUserAddresses(user.id) : [];

  return (
    <Suspense fallback={null}>
      <CheckoutClient
        isPaymentConfigured={isActiveProviderConfigured()}
        isUpiEnabled={isUpiDirectEnabled()}
        isSignedIn={Boolean(user)}
        savedAddresses={savedAddresses}
      />
    </Suspense>
  );
}
