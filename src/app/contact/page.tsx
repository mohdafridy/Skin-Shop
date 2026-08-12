import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with The Skin Shop.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 sm:px-8">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
        Get In Touch
      </p>
      <h1 className="text-balance text-center font-display text-4xl leading-tight text-ink">
        We&apos;d Love To Hear From You
      </h1>
      <p className="mt-4 text-balance text-center leading-relaxed text-walnut/75">
        Questions about a product, an order, or a ritual you&apos;re building — send us
        a note and we&apos;ll get back to you.
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
