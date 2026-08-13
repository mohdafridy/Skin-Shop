import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      intro="These terms govern your use of The Skin Shop website and the purchase of products through it. Our full terms will be published here."
      sections={[
        {
          heading: "Using this site",
          body: "You agree to use this site for lawful purposes and to provide accurate information when placing an order or contacting us.",
        },
        {
          heading: "Product information",
          body: "We aim to describe our products accurately. Colours, textures and packaging may vary slightly from what's shown on screen.",
        },
        {
          heading: "Questions",
          body: "If anything in these terms is unclear, reach out through our Contact page.",
        },
      ]}
    />
  );
}
