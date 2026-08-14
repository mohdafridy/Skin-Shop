import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { contactEmail, contactPhoneDisplay, whatsappLink } from "@/data/contact";
import { WhatsAppIcon } from "@/components/icons";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with The Skin Shop.",
  alternates: canonical("/contact"),
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

      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-gold/20 bg-white/40 p-6 text-center sm:flex-row sm:justify-center sm:gap-8">
        <a
          href={`mailto:${contactEmail}`}
          className="text-sm font-medium text-ink transition hover:text-burgundy"
        >
          {contactEmail}
        </a>
        <a
          href={whatsappLink("Hi! I have a question about The Skin Shop.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink transition hover:text-burgundy"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {contactPhoneDisplay}
        </a>
      </div>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
