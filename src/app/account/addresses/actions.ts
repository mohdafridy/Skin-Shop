"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressInputSchema, createUserAddress } from "@/lib/addresses";

export type AddressActionState = { error?: string; success?: string } | null;

function parse(formData: FormData) {
  return addressInputSchema.safeParse({
    label: formData.get("label") || undefined,
    name: formData.get("name"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || undefined,
  });
}

export async function createAddressAction(
  _prev: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };

  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid address." };

  const result = await createUserAddress(user.id, parsed.data, formData.get("makeDefault") === "on");
  if (!result.ok) return { error: result.error };

  revalidatePath("/account");
  return { success: "Address saved." };
}

export async function updateAddressAction(
  _prev: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };

  const id = String(formData.get("addressId") || "");
  if (!id) return { error: "Invalid address." };

  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid address." };
  const data = parsed.data;

  try {
    // Scope the update to this user's own row — a forged id can't touch
    // someone else's address.
    const updated = await prisma.address.updateMany({
      where: { id, userId: user.id },
      data: {
        label: data.label?.trim() || null,
        name: data.name,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2?.trim() || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || "India",
      },
    });
    if (updated.count !== 1) return { error: "Address not found." };
  } catch (error) {
    console.error("update_address_failed", error);
    return { error: "Couldn't update this address. Please try again." };
  }

  revalidatePath("/account");
  return { success: "Address updated." };
}

export async function deleteAddressAction(
  _prev: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };

  const id = String(formData.get("addressId") || "");
  if (!id) return { error: "Invalid address." };

  try {
    const deleted = await prisma.address.deleteMany({ where: { id, userId: user.id } });
    if (deleted.count !== 1) return { error: "Address not found." };

    // If we removed the default, promote the most recent remaining address so
    // the user always has a default to pre-fill checkout with.
    const remaining = await prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, isDefault: true },
    });
    if (remaining && !remaining.isDefault) {
      const anyDefault = await prisma.address.count({ where: { userId: user.id, isDefault: true } });
      if (anyDefault === 0) {
        await prisma.address.update({ where: { id: remaining.id }, data: { isDefault: true } });
      }
    }
  } catch (error) {
    console.error("delete_address_failed", error);
    return { error: "Couldn't remove this address. Please try again." };
  }

  revalidatePath("/account");
  return { success: "Address removed." };
}

export async function setDefaultAddressAction(
  _prev: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };

  const id = String(formData.get("addressId") || "");
  if (!id) return { error: "Invalid address." };

  try {
    // Confirm ownership before flipping any defaults.
    const owned = await prisma.address.count({ where: { id, userId: user.id } });
    if (owned !== 1) return { error: "Address not found." };

    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } }),
      prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);
  } catch (error) {
    console.error("set_default_address_failed", error);
    return { error: "Couldn't update your default address. Please try again." };
  }

  revalidatePath("/account");
  return { success: "Default address updated." };
}
