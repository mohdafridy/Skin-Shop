import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { contactEmail } from "@/data/contact";
import { PaymentStatusBadge } from "@/components/OrderStatusBadge";
import { upiVpa, upiPayeeName, buildUpiIntentUrl, UPI_PROVIDER_ID } from "@/data/payment";
import { noIndex } from "@/lib/seo";
import CopyButton from "./CopyButton";

export const metadata: Metadata = {
  title: "Complete Your UPI Payment",
  robots: noIndex,
};

// An order's payment status changes after the page was first built.
export const dynamic = "force-dynamic";

function Shell({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 sm:px-8">
      <h1 className="mb-4 font-display text-3xl text-ink">{heading}</h1>
      {children}
    </div>
  );
}

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let order = null;
  try {
    // accessTokens are 64 hex chars; reject anything else without a query.
    if (/^[a-f0-9]{64}$/.test(token)) {
      order = await prisma.order.findUnique({
        where: { accessToken: token },
        select: {
          orderNumber: true,
          total: true,
          currency: true,
          paymentStatus: true,
          paymentProvider: true,
          customerName: true,
        },
      });
    }
  } catch {
    return (
      <Shell heading="We can't load that order right now.">
        <p className="text-sm text-walnut/70">
          Please try again in a moment, or email us at {contactEmail}.
        </p>
      </Shell>
    );
  }

  if (!order) {
    return (
      <Shell heading="We couldn't find that order.">
        <p className="text-sm text-walnut/70">
          Check the link from your order, or email us at {contactEmail} and we&apos;ll help.
        </p>
      </Shell>
    );
  }

  // This page is only for direct-UPI orders. A gateway order goes to tracking.
  if (order.paymentProvider !== UPI_PROVIDER_ID) {
    redirect(`/track/${token}`);
  }

  const amountLabel = formatPrice(order.total, order.currency);

  // Already settled — show a calm confirmation instead of the pay UI.
  if (order.paymentStatus !== "PENDING") {
    const paid = order.paymentStatus === "PAID";
    return (
      <Shell heading={paid ? "Payment received — thank you!" : "Order status"}>
        <div className="rounded-2xl border border-gold/20 bg-white/50 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-walnut/70">Order {order.orderNumber}</span>
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
          <p className="mt-4 text-sm text-walnut/75">
            {paid
              ? "We've confirmed your UPI payment and your order is being prepared. You'll hear from us when it ships."
              : "There's nothing to pay on this order right now. If you think this is a mistake, email us and we'll help."}
          </p>
          <Link
            href={`/track/${token}`}
            className="mt-5 inline-block text-sm font-medium text-burgundy underline-offset-2 hover:underline"
          >
            Track your order →
          </Link>
        </div>
      </Shell>
    );
  }

  const note = `Order ${order.orderNumber}`;
  const upiUrl = buildUpiIntentUrl({ amount: order.total, note });
  // Server-render the QR as inline SVG — no client library, scales crisply.
  const qrSvg = await QRCode.toString(upiUrl, {
    type: "svg",
    margin: 1,
    color: { dark: "#2a201c", light: "#00000000" },
  });

  return (
    <div className="mx-auto max-w-xl px-6 py-14 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
        Pay by UPI
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">
        {amountLabel} to complete your order
      </h1>
      <p className="mt-2 text-sm text-walnut/70">
        Order {order.orderNumber} is placed. Pay the exact amount by UPI and we&apos;ll confirm
        it and dispatch your order.
      </p>

      <div className="mt-8 rounded-2xl border border-gold/20 bg-white/50 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div
            className="h-56 w-56 [&>svg]:h-full [&>svg]:w-full"
            aria-label="UPI payment QR code"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="mt-4 text-sm text-walnut/70">
            Scan with any UPI app (GPay, PhonePe, Paytm, BHIM). The amount is filled in for you.
          </p>

          <a
            href={upiUrl}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-burgundy px-7 py-3 text-sm font-medium text-ivory transition hover:bg-burgundy-dark sm:hidden"
          >
            Open in UPI app
          </a>
        </div>

        <div className="mt-6 border-t border-gold/20 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-walnut/60">
            Or pay to this UPI ID
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="min-w-0 truncate font-mono text-sm text-ink">{upiVpa}</span>
            <CopyButton value={upiVpa} label="Copy UPI ID" />
          </div>
          <p className="mt-2 text-xs text-walnut/60">
            Payee: {upiPayeeName} · Amount: {amountLabel}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gold/20 bg-sand/30 p-5 text-sm text-walnut/75">
        <p className="font-medium text-ink">After you pay</p>
        <p className="mt-1">
          We verify UPI payments by hand, so it isn&apos;t instant — we&apos;ll confirm and start
          preparing your order shortly. No need to pay again.
        </p>
        <Link
          href={`/track/${token}`}
          className="mt-3 inline-block text-sm font-medium text-burgundy underline-offset-2 hover:underline"
        >
          Track your order →
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-walnut/50">
        Trouble paying? Email us at {contactEmail} with your order number.
      </p>
    </div>
  );
}
