import type { NextConfig } from "next";

/**
 * Built from the site's actual integrations, not a generic template:
 * - checkout.razorpay.com / api.razorpay.com / lumberjack.razorpay.com are
 *   Razorpay Checkout's own script, API, and logging origins — omitting any
 *   of them breaks payment.
 * - 'unsafe-inline' on script-src/style-src is required because this app
 *   has no nonce middleware, and Next.js's App Router emits inline
 *   hydration `<script>` tags (RSC payload) on every page without one. A
 *   stricter nonce-based CSP is possible later but needs its own careful
 *   rollout, not bundled into a header-only change.
 * - No analytics/ads/embed providers are connected (see src/lib/analytics.ts),
 *   so nothing else needs allowlisting.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // Next 16 only allows re-encoding to qualities listed here (default:
    // [75] — a security allowlist, not a quality preference). Product
    // photography needs more headroom than 75 before compression artifacts
    // (banding, blockiness) become visible on glass/cream textures.
    qualities: [75, 90],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
