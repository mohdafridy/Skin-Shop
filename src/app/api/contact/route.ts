import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/notifications/email";
import { contactEmail } from "@/data/contact";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(4000),
});

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 15 * 60 * 1000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Receives a contact-form submission and emails it to the store inbox.
 *
 * The recipient is always the fixed store address — the client cannot direct
 * this at an arbitrary address, so it can't be turned into an email relay.
 * reply-to is set to the sender so the owner can reply straight to them.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const { allowed } = await checkRateLimit(`contact:${ip}`, CONTACT_LIMIT, CONTACT_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many messages. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Please enter your name, a valid email, and a message." },
      { status: 400 },
    );
  }

  const { name, email, message } = parsed.data;

  const text = [
    `New message from the contact form`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");

  const html = [
    `<p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;"><strong>New contact-form message</strong></p>`,
    `<p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;">Name: ${escapeHtml(name)}<br>Email: ${escapeHtml(email)}</p>`,
    `<p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;white-space:pre-wrap;">${escapeHtml(message)}</p>`,
  ].join("");

  const result = await sendEmail({
    to: contactEmail,
    subject: `Contact form: ${name}`,
    html,
    text,
    replyTo: email,
  });

  if (result.status === "sent") {
    return NextResponse.json({ ok: true, message: "Thanks — we've received your message." });
  }

  // Email not configured, or the provider failed. Tell the customer honestly
  // and give them the direct address rather than silently dropping it.
  console.error("contact_form_send_failed", { status: result.status });
  return NextResponse.json(
    {
      ok: false,
      message: `We couldn't send that just now. Please email us directly at ${contactEmail}.`,
    },
    { status: 502 },
  );
}
