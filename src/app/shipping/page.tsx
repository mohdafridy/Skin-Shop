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
      intro="We aim to prepare and dispatch every order with care. Shipping costs are calculated automatically at checkout based on your delivery city and what's in your order."
      sections={[
        {
          heading: "Shipping charges",
          body: "₹50 for delivery within Srinagar. ₹120 for delivery to other states. Shipping is free on all combo orders, everywhere in India.",
        },
        {
          heading: "Delivery time",
          body: "Orders are usually delivered within 5–6 working days of dispatch.",
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
