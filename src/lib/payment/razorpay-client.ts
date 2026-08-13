/**
 * Browser-side Razorpay Checkout launcher.
 *
 * Loads Razorpay's script on demand (rather than on every page load) and
 * opens the modal. Only the public key id is used here. The handler result is
 * never treated as proof of payment — it is posted to
 * /api/payments/razorpay/verify, which checks the HMAC signature server-side
 * before any order is marked paid.
 */

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function loadScript(): Promise<RazorpayConstructor> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const onLoad = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay Checkout failed to initialise."));
    };

    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", () => reject(new Error("Razorpay Checkout failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("Razorpay Checkout failed to load.")), { once: true });
    document.body.appendChild(script);
  });
}

export type RazorpayCheckoutConfig = {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  accessToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export type RazorpayCheckoutOutcome =
  | { status: "verified"; redirectUrl: string }
  | { status: "dismissed" }
  | { status: "failed"; reason: string };

/**
 * Opens Razorpay Checkout and resolves once the outcome is known. Resolves
 * rather than rejects for dismissal and failure so the caller can restore the
 * form without try/catch around UI state.
 */
export async function openRazorpayCheckout(
  config: RazorpayCheckoutConfig,
): Promise<RazorpayCheckoutOutcome> {
  let Razorpay: RazorpayConstructor;
  try {
    Razorpay = await loadScript();
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Razorpay Checkout failed to load.",
    };
  }

  return new Promise<RazorpayCheckoutOutcome>((resolve) => {
    let settled = false;
    const settle = (outcome: RazorpayCheckoutOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    const instance = new Razorpay({
      key: config.keyId,
      order_id: config.razorpayOrderId,
      amount: config.amount,
      currency: config.currency,
      name: "The Skin Shop",
      description: `Order ${config.orderNumber}`,
      prefill: {
        name: config.customerName,
        email: config.customerEmail,
        contact: config.customerPhone,
      },
      notes: { orderNumber: config.orderNumber },
      theme: { color: "#7d2a3f" },
      modal: {
        ondismiss: () => settle({ status: "dismissed" }),
      },
      handler: async (response: RazorpayHandlerResponse) => {
        try {
          const verify = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: config.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          const data = await verify.json().catch(() => null);

          if (!verify.ok || !data?.verified) {
            settle({
              status: "failed",
              reason:
                data?.message ??
                "We couldn't confirm your payment. If you were charged, it will be confirmed shortly — please don't pay again.",
            });
            return;
          }
          settle({ status: "verified", redirectUrl: data.redirectUrl });
        } catch {
          settle({
            status: "failed",
            reason:
              "Your payment went through but we couldn't confirm it here. It will be confirmed shortly — please don't pay again.",
          });
        }
      },
    });

    instance.open();
  });
}
