import { createHmac, timingSafeEqual } from "node:crypto";
import { toMinorUnits } from "./format";

/**
 * Razorpay REST access. Deliberately dependency-free: the three calls we
 * need (create order, fetch payment, refund) are plain authenticated JSON
 * requests, and signature verification is HMAC-SHA256 from node:crypto.
 *
 * Nothing here throws at import time, so every route that imports this
 * module stays loadable before credentials exist — the same pattern
 * src/lib/stripe.ts uses.
 *
 * KEY_SECRET and WEBHOOK_SECRET are server-only. Only RAZORPAY_KEY_ID is
 * ever safe to expose to the browser (it is the public checkout key).
 */

const API_BASE = "https://api.razorpay.com/v1";

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function isRazorpayWebhookConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
}

/** The public key id, safe for the browser. Returns null when unconfigured. */
export function razorpayPublicKeyId(): string | null {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || null;
}

function authHeader(): string {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set.");
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

async function razorpayFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON error body; fall through to the generic message below.
  }

  if (!response.ok) {
    const description =
      (body as { error?: { description?: string } } | null)?.error?.description ??
      `Razorpay request failed (${response.status}).`;
    // Message only — never the request body, which carries customer data.
    throw new Error(description);
  }

  return body as T;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
};

/**
 * Creates the gateway-side order. `amount` is in whole currency units
 * (₹380 = 380) like everything else in this codebase; conversion to paise
 * happens here, at the API boundary, and nowhere else.
 */
export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  /** Our internal order number — shown in the Razorpay dashboard. */
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  return razorpayFetch<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: toMinorUnits(input.amount),
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
      payment_capture: 1,
    }),
  });
}

export type RazorpayPayment = {
  id: string;
  order_id: string;
  status: string;
  method?: string;
  amount: number;
  currency: string;
  email?: string;
  contact?: string;
};

export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  return razorpayFetch<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

/**
 * Issues a refund. Exposed so the store owner's tooling can trigger one;
 * the resulting refund.* webhook is what actually moves our order to
 * REFUNDED, so this never writes a refunded status itself.
 */
export async function refundPayment(input: {
  paymentId: string;
  /** Whole currency units. Omit for a full refund. */
  amount?: number;
  notes?: Record<string, string>;
}): Promise<{ id: string; status: string; amount: number }> {
  return razorpayFetch(`/payments/${encodeURIComponent(input.paymentId)}/refund`, {
    method: "POST",
    body: JSON.stringify({
      ...(input.amount !== undefined ? { amount: toMinorUnits(input.amount) } : {}),
      notes: input.notes,
    }),
  });
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Verifies the signature Razorpay Checkout hands the browser after payment.
 * Signed as HMAC-SHA256("<razorpay_order_id>|<razorpay_payment_id>") with
 * the key secret. A valid signature proves the gateway produced this
 * result — never trust the browser's claim of success without it.
 */
export function verifyRazorpayPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  return safeEqualHex(expected, input.signature);
}

/**
 * Verifies a webhook delivery. Signed as HMAC-SHA256 over the *raw* request
 * body with the webhook secret — which is a different secret from the key
 * secret, and why the route must read the body as text before parsing.
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
