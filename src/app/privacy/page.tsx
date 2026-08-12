import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      intro="The Skin Shop respects your privacy. This page will hold our full privacy policy, covering what information we collect, how it's used, and the choices available to you."
      sections={[
        {
          heading: "Information we collect",
          body: "Details provided when you contact us, join our newsletter, or place an order — such as name, email and shipping address.",
        },
        {
          heading: "How it's used",
          body: "To respond to enquiries, fulfil orders and share the updates you've asked for. We do not sell personal information.",
        },
        {
          heading: "Your choices",
          body: "You can unsubscribe from emails at any time, or contact us with any questions about your information.",
        },
      ]}
    />
  );
}
