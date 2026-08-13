/**
 * WhatsApp Cloud API (Meta) — server-initiated template messages.
 *
 * This is a different mechanism from src/lib/whatsapp-order.ts, which builds
 * wa.me deep links the *customer* taps to start a chat. That needs no
 * credentials and stays as-is. This module is how *we* message the customer
 * after an order event, which Meta only permits via approved templates.
 *
 * WHATSAPP_ACCESS_TOKEN is server-only and must never reach the browser.
 */

export type WhatsAppSendResult =
  | { status: "sent"; messageId: string | null }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Normalises an Indian phone number to the digits-only, country-coded form
 * the Cloud API expects. Returns null when it cannot be trusted, so we skip
 * rather than send to a wrong number.
 */
export function normalisePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  // Already country-coded for somewhere else, or unusable.
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

/**
 * Sends one approved template. Parameters are positional and must match the
 * order documented in WHATSAPP_TEMPLATES.md — Meta substitutes them into
 * {{1}}, {{2}}, … so the caller never supplies message prose.
 *
 * Never throws. A WhatsApp outage must not fail the caller's order flow.
 */
export async function sendWhatsAppTemplate(input: {
  phone: string;
  templateName: string;
  languageCode: string;
  parameters: string[];
}): Promise<WhatsAppSendResult> {
  if (!isWhatsAppConfigured()) {
    return {
      status: "skipped",
      reason:
        "WhatsApp is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable it.",
    };
  }

  const phone = normalisePhone(input.phone);
  if (!phone) {
    return { status: "skipped", reason: "No usable phone number on the order." };
  }

  const version = process.env.WHATSAPP_API_VERSION || "v21.0";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: input.templateName,
            language: { code: input.languageCode },
            components: input.parameters.length
              ? [
                  {
                    type: "body",
                    parameters: input.parameters.map((text) => ({ type: "text", text })),
                  },
                ]
              : [],
          },
        }),
        cache: "no-store",
      },
    );

    const body = (await response.json().catch(() => null)) as
      | { messages?: { id: string }[]; error?: { message?: string } }
      | null;

    if (!response.ok) {
      // Meta's message only — never the request body (customer phone) or token.
      return {
        status: "failed",
        error: body?.error?.message ?? `WhatsApp API returned ${response.status}.`,
      };
    }

    return { status: "sent", messageId: body?.messages?.[0]?.id ?? null };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "WhatsApp request failed.",
    };
  }
}
