import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <PolicyPage
      title="Returns"
      intro="If something isn't right with your order, we want to help make it right. Full return and exchange terms will be confirmed at checkout and in your order confirmation."
      sections={[
        {
          heading: "Damaged or incorrect items",
          body: "If your order arrives damaged or you've received the wrong item, contact us as soon as possible with your order details.",
        },
        {
          heading: "How to start a return",
          body: "Reach out through our Contact page with your order number and we'll guide you through the next steps.",
        },
      ]}
    />
  );
}
