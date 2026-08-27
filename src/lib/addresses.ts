import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Saved delivery addresses for signed-in shoppers. A pure convenience layer:
 * an order still copies address values into its own snapshot fields, so a
 * saved address is never referenced by an order and editing or deleting one
 * never rewrites past-order history.
 *
 * Every read degrades to "no addresses" if the Address table doesn't exist
 * yet (migration pending) or the DB is unreachable, so the account and
 * checkout pages keep working exactly as before until the migration is run.
 */

export const addressInputSchema = z.object({
  label: z.string().trim().max(40).optional(),
  name: z.string().trim().min(1, "Name is required.").max(160),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20),
  line1: z.string().trim().min(1, "Address is required.").max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "City is required.").max(100),
  state: z.string().trim().min(1, "State is required.").max(100),
  postalCode: z.string().trim().min(1, "PIN code is required.").max(20),
  country: z.string().trim().min(1).max(100).default("India"),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

export type SavedAddress = {
  id: string;
  label: string | null;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const addressSelect = {
  id: true,
  label: true,
  name: true,
  phone: true,
  line1: true,
  line2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  isDefault: true,
} as const;

/** Default first, then most-recently-touched. Returns [] on any DB error
 * (including the table not existing yet) so callers never crash. */
export async function listUserAddresses(userId: string): Promise<SavedAddress[]> {
  try {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      select: addressSelect,
    });
  } catch {
    return [];
  }
}

const MAX_ADDRESSES = 15;

/** Normalizes optional string fields: empty/whitespace becomes null. */
function orNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Creates an address for a user. The first address a user saves becomes their
 * default; `makeDefault` forces it and clears any previous default in the same
 * transaction. Silently skips (returns the match) when an identical address
 * already exists, so saving the same address at checkout twice is a no-op.
 */
export async function createUserAddress(
  userId: string,
  input: AddressInput,
  makeDefault = false,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const existing = await prisma.address.findMany({ where: { userId }, select: addressSelect });
    if (existing.length >= MAX_ADDRESSES) {
      return { ok: false, error: "You've reached the maximum number of saved addresses." };
    }

    // De-dupe on the meaningful fields so a repeat checkout-save doesn't pile
    // up copies of the same address.
    const duplicate = existing.find(
      (a) =>
        a.name === input.name &&
        a.line1 === input.line1 &&
        (a.line2 ?? "") === (input.line2?.trim() ?? "") &&
        a.city === input.city &&
        a.postalCode === input.postalCode,
    );
    if (duplicate) return { ok: true, id: duplicate.id };

    const isDefault = makeDefault || existing.length === 0;

    const created = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
      }
      return tx.address.create({
        data: {
          userId,
          label: orNull(input.label),
          name: input.name,
          phone: input.phone,
          line1: input.line1,
          line2: orNull(input.line2),
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country || "India",
          isDefault,
        },
        select: { id: true },
      });
    });
    return { ok: true, id: created.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      // Table doesn't exist yet — the migration hasn't been applied.
      return { ok: false, error: "Saved addresses aren't available yet." };
    }
    console.error("create_user_address_failed", error);
    return { ok: false, error: "Couldn't save this address. Please try again." };
  }
}
