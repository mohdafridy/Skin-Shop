// As supplied by the business.
export const contactEmail = "theskinshopofficial@gmail.com";

// Display format for the phone number shown in UI copy.
export const contactPhoneDisplay = "+91 70069 20093";

// Digits-only, country-code-prefixed — the format wa.me links require.
export const whatsappNumber = "917006920093";

/** Builds a wa.me deep link, optionally pre-filling the message text. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// As supplied by the business.
export const instagramHandle = "@skinshopofficial";
export const instagramUrl = "https://www.instagram.com/skinshopofficial";
