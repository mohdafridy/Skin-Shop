import { Suspense } from "react";
import type { Metadata } from "next";
import { isActiveProviderConfigured } from "@/lib/payment/server";
import CheckoutClient from "./CheckoutClient";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Guest checkout for The Skin Shop — no account required.",
  robots: noIndex,
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutClient isPaymentConfigured={isActiveProviderConfigured()} />
    </Suspense>
  );
}
