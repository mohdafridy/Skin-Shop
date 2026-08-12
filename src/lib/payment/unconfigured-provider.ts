import type { PaymentProvider } from "./types";

/**
 * The only provider currently wired up. It never pretends to accept a
 * payment — `initiate` always resolves to "unavailable" so checkout can
 * surface an honest pending-configuration state instead of a fake success.
 */
export const unconfiguredProvider: PaymentProvider = {
  id: "unconfigured",
  name: "Not yet connected",
  isConfigured: false,
  async initiate() {
    return {
      status: "unavailable",
      reason:
        "No payment gateway is connected yet. Add a Razorpay, Stripe, or other approved provider integration to accept payment.",
    };
  },
};
