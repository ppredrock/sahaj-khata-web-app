import { db } from "@/lib/db/client";
import { udharTransactions, gallaTransactions, contacts } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { NewUdharTransaction, UdharTransaction } from "@/lib/types";
import { getTodayDateString } from "@/lib/utils";

export async function getUdharTransactions(params?: {
  contactId?: string;
  settled?: boolean;
  type?: "given" | "received";
  limit?: number;
}) {
  const conditions = [eq(udharTransactions.isDeleted, false)];

  if (params?.contactId) {
    conditions.push(eq(udharTransactions.contactId, params.contactId));
  }
  if (params?.settled !== undefined) {
    conditions.push(eq(udharTransactions.settled, params.settled));
  }
  if (params?.type) {
    conditions.push(eq(udharTransactions.type, params.type));
  }

  let query = db
    .select({
      id: udharTransactions.id,
      date: udharTransactions.date,
      type: udharTransactions.type,
      amount: udharTransactions.amount,
      contactId: udharTransactions.contactId,
      contactName: contacts.name,
      contactPhone: contacts.phone,
      contactType: contacts.type,
      description: udharTransactions.description,
      dueDate: udharTransactions.dueDate,
      linkedGallaId: udharTransactions.linkedGallaId,
      settled: udharTransactions.settled,
      settledDate: udharTransactions.settledDate,
      createdAt: udharTransactions.createdAt,
    })
    .from(udharTransactions)
    .innerJoin(contacts, eq(udharTransactions.contactId, contacts.id))
    .where(and(...conditions))
    .orderBy(desc(udharTransactions.createdAt));

  if (params?.limit) {
    return query.limit(params.limit);
  }

  return query;
}

export async function createUdharTransaction(
  data: Omit<NewUdharTransaction, "id" | "createdAt" | "updatedAt">,
  syncToGalla: boolean = false
) {
  let linkedGallaId: string | undefined = undefined;

  // If syncToGalla is true:
  // - Type "received": money came in from customer -> inflow to Galla
  // - Type "given": money went out from cash drawer -> outflow from Galla
  if (syncToGalla) {
    const [gallaEntry] = await db
      .insert(gallaTransactions)
      .values({
        date: data.date,
        type: data.type === "received" ? "inflow" : "outflow",
        amount: data.amount,
        category: data.type === "received" ? "sale" : "other",
        description: `Udhar ${data.type === "received" ? "Wapsi" : "Diya"}: ${data.description || ""}`,
        contactId: data.contactId,
        paymentMode: "cash",
      })
      .returning();
    linkedGallaId = gallaEntry.id;
  }

  const [udharEntry] = await db
    .insert(udharTransactions)
    .values({
      ...data,
      linkedGallaId,
    })
    .returning();

  return udharEntry;
}

export async function settleUdharTransaction(
  id: string,
  settledDate: string = getTodayDateString(),
  syncToGalla: boolean = false
) {
  const [existing] = await db
    .select()
    .from(udharTransactions)
    .where(eq(udharTransactions.id, id));

  if (!existing) return null;

  let linkedGallaId = existing.linkedGallaId;

  if (syncToGalla && !linkedGallaId) {
    // Record payment settlement in Galla
    const [gallaEntry] = await db
      .insert(gallaTransactions)
      .values({
        date: settledDate,
        type: existing.type === "given" ? "inflow" : "outflow",
        amount: existing.amount,
        category: "sale",
        description: `Udhar Chuktā: ${existing.description || ""}`,
        contactId: existing.contactId,
        paymentMode: "cash",
      })
      .returning();
    linkedGallaId = gallaEntry.id;
  }

  return db
    .update(udharTransactions)
    .set({
      settled: true,
      settledDate,
      linkedGallaId,
      updatedAt: new Date(),
    })
    .where(eq(udharTransactions.id, id));
}

export async function deleteUdharTransaction(id: string) {
  return db
    .update(udharTransactions)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(udharTransactions.id, id));
}
