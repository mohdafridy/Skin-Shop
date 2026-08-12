import { Suspense } from "react";
import type { Metadata } from "next";
import { isStripeConfigured } from "@/lib/stripe";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Guest checkout for The Skin Shop — no account required.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutClient isPaymentConfigured={isStripeConfigured()} />
    </Suspense>
  );
}
