import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPin, verifyPin } from "@/lib/auth/pin";
import type { Profile } from "@/lib/types";

export async function getProfile(): Promise<Profile> {
  const [existing] = await db.select().from(profiles).limit(1);
  if (existing) return existing;

  // Auto initialize default profile on first run
  const [created] = await db
    .insert(profiles)
    .values({
      storeName: "Sahaj Kirana Store",
      ownerName: "Dukandar",
      phone: "",
      currency: "₹",
    })
    .returning();

  return created;
}

export async function updateProfile(data: {
  storeName?: string;
  ownerName?: string;
  phone?: string;
  upiId?: string;
  address?: string;
  pin?: string;
}) {
  const current = await getProfile();

  const updateData: Partial<typeof profiles.$inferInsert> = {};
  if (data.storeName !== undefined) updateData.storeName = data.storeName;
  if (data.ownerName !== undefined) updateData.ownerName = data.ownerName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.upiId !== undefined) updateData.upiId = data.upiId;
  if (data.address !== undefined) updateData.address = data.address;

  if (data.pin && data.pin.trim() !== "") {
    updateData.pinHash = await hashPin(data.pin.trim());
  }

  const [updated] = await db
    .update(profiles)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, current.id))
    .returning();

  return updated;
}
