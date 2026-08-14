import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Shipping options and delivery information for The Skin Shop orders across India.",
  alternates: canonical("/shipping"),
};

export default function ShippingPage() {
  return (
    <PolicyPage
      title="Shipping"
      intro="We aim to prepare and dispatch every order with care. Shipping methods, costs and estimated delivery windows are shown at checkout before you complete your order, based on your location."
      sections={[
        {
          heading: "Processing time",
          body: "Orders are generally processed within a few business days. You'll receive a confirmation once your order has shipped.",
        },
        {
          heading: "Tracking",
          body: "Where available, tracking details will be shared with you by email so you can follow your order's progress.",
        },
        {
          heading: "Questions",
          body: "If your order hasn't arrived when expected, reach out through our Contact page and we'll help.",
        },
      ]}
    />
  );
}
