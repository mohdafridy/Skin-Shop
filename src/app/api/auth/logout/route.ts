import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();
  } catch (error) {
    console.error(error);
  }
  // Signing out always reports success — the cookie is gone either way.
  return NextResponse.json({ ok: true });
}
