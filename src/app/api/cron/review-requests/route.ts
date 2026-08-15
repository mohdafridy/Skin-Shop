import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestReview } from "@/lib/orders/events";

export const runtime = "nodejs";

/**
 * Runs daily via Vercel Cron (see vercel.json). Finds orders delivered at
 * least 5 days ago that have never had a review request sent, and sends one
 * per order via requestReview — which records the event and dispatches
 * through the existing WhatsApp/email pipeline.
 *
 * Never invents reviews itself: this only ever nudges the customer to leave
 * their own.
 */
const REVIEW_REQUEST_DELAY_DAYS = 5;
const BATCH_SIZE = 50;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - REVIEW_REQUEST_DELAY_DAYS * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      fulfilmentStatus: "DELIVERED",
      deliveredAt: { lte: cutoff },
      notifications: { none: { eventType: "REVIEW_REQUESTED" } },
    },
    select: { id: true, orderNumber: true },
    take: BATCH_SIZE,
  });

  const results = await Promise.allSettled(orders.map((order) => requestReview(order.id)));
  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({ eligible: orders.length, sent, failed });
}
