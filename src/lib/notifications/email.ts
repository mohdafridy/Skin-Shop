/**
 * Provider-agnostic transactional email.
 *
 * No email provider was already in use, so the seam is the point: swapping
 * Resend for SES/Postmark/SendGrid means adding one case to `deliver()` and
 * changing EMAIL_PROVIDER — no caller changes. EMAIL_PROVIDER_API_KEY is
 * server-only.
 */

export type EmailSendResult =
  | { status: "sent"; messageId: string | null }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

type EmailProviderId = "resend" | "none";

function providerId(): EmailProviderId {
  const configured = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
  if (!process.env.EMAIL_PROVIDER_API_KEY || !process.env.EMAIL_FROM) return "none";
  return configured === "resend" ? "resend" : "none";
}

export function isEmailConfigured(): boolean {
  return providerId() !== "none";
}

/** Minimal RFC-shaped check — enough to avoid sending to obvious garbage
 * without inventing stricter rules than the checkout form already applies. */
export function isValidEmail(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function deliverViaResend(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as
    | { id?: string; message?: string }
    | null;

  if (!response.ok) {
    return { status: "failed", error: body?.message ?? `Email API returned ${response.status}.` };
  }
  return { status: "sent", messageId: body?.id ?? null };
}

/**
 * Sends one email. Never throws — a provider outage must not fail the
 * order flow that triggered it.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  const provider = providerId();
  if (provider === "none") {
    return {
      status: "skipped",
      reason:
        "Email is not configured. Set EMAIL_PROVIDER_API_KEY and EMAIL_FROM to enable it.",
    };
  }
  if (!isValidEmail(input.to)) {
    return { status: "skipped", reason: "Order has no valid email address." };
  }

  try {
    return await deliverViaResend(input);
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Email request failed.",
    };
  }
}
