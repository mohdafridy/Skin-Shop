import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Returns",
  description: "The Skin Shop's return and refund policy.",
  alternates: canonical("/returns"),
};

export default function ReturnsPage() {
  return (
    <PolicyPage
      title="Returns"
      intro="For genuine cases — damaged, leaking, incorrect or missing items — we replace the product. We do not offer refunds."
      sections={[
        {
          heading: "Damaged, leaking, incorrect or missing items",
          body: "Contact us with your order number and photos of the item (and packaging, if damaged) as soon as possible, and we'll arrange a replacement.",
        },
        {
          heading: "How to start a replacement",
          body: "Reach out through our Contact page or WhatsApp with your order number and photos, and we'll guide you through the next steps.",
        },
      ]}
    />
  );
}
