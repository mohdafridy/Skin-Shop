import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addressInputSchema, createUserAddress } from "@/lib/addresses";

export const dynamic = "force-dynamic";

/** Saves a shipping address to the signed-in customer's account. Used by the
 * checkout "Save this address for next time" option. Requires a session. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = addressInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid address." },
      { status: 400 },
    );
  }

  const result = await createUserAddress(user.id, parsed.data, false);
  if (!result.ok) {
    return NextResponse.json({ error: "save_failed", message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
