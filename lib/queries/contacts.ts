import { db } from "@/lib/db/client";
import { contacts, udharTransactions, gallaTransactions } from "@/lib/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import type { ContactWithBalance, NewContact, Contact } from "@/lib/types";

export async function getContactsWithBalance(typeFilter?: "customer" | "supplier"): Promise<ContactWithBalance[]> {
  const conditions = [eq(contacts.isDeleted, false)];
  if (typeFilter) {
    conditions.push(eq(contacts.type, typeFilter));
  }

  const allContacts = await db
    .select()
    .from(contacts)
    .where(and(...conditions))
    .orderBy(asc(contacts.name));

  const allUdhar = await db
    .select({
      contactId: udharTransactions.contactId,
      type: udharTransactions.type,
      amount: udharTransactions.amount,
      settled: udharTransactions.settled,
      date: udharTransactions.date,
    })
    .from(udharTransactions)
    .where(
      and(
        eq(udharTransactions.isDeleted, false),
        eq(udharTransactions.settled, false)
      )
    );

  const statsMap: Record<
    string,
    { totalGiven: number; totalReceived: number; lastDate: string | null }
  > = {};

  for (const u of allUdhar) {
    if (!statsMap[u.contactId]) {
      statsMap[u.contactId] = { totalGiven: 0, totalReceived: 0, lastDate: null };
    }
    if (u.type === "given") {
      statsMap[u.contactId].totalGiven += u.amount;
    } else {
      statsMap[u.contactId].totalReceived += u.amount;
    }
    if (!statsMap[u.contactId].lastDate || u.date > statsMap[u.contactId].lastDate!) {
      statsMap[u.contactId].lastDate = u.date;
    }
  }

  return allContacts.map((c) => {
    const stats = statsMap[c.id] || { totalGiven: 0, totalReceived: 0, lastDate: null };
    const netBalance = stats.totalGiven - stats.totalReceived;
    return {
      ...c,
      totalGiven: stats.totalGiven,
      totalReceived: stats.totalReceived,
      netBalance,
      lastTransactionDate: stats.lastDate,
    };
  });
}

export async function getContactById(id: string): Promise<ContactWithBalance | null> {
  const [c] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.isDeleted, false)));

  if (!c) return null;

  const udharList = await db
    .select({
      type: udharTransactions.type,
      amount: udharTransactions.amount,
      date: udharTransactions.date,
    })
    .from(udharTransactions)
    .where(
      and(
        eq(udharTransactions.contactId, id),
        eq(udharTransactions.isDeleted, false),
        eq(udharTransactions.settled, false)
      )
    );

  let totalGiven = 0;
  let totalReceived = 0;
  let lastDate: string | null = null;

  for (const u of udharList) {
    if (u.type === "given") totalGiven += u.amount;
    else totalReceived += u.amount;
    if (!lastDate || u.date > lastDate) lastDate = u.date;
  }

  return {
    ...c,
    totalGiven,
    totalReceived,
    netBalance: totalGiven - totalReceived,
    lastTransactionDate: lastDate,
  };
}

export async function getContactStatement(contactId: string) {
  const udhar = await db
    .select()
    .from(udharTransactions)
    .where(
      and(
        eq(udharTransactions.contactId, contactId),
        eq(udharTransactions.isDeleted, false)
      )
    )
    .orderBy(desc(udharTransactions.date), desc(udharTransactions.createdAt));

  const galla = await db
    .select()
    .from(gallaTransactions)
    .where(
      and(
        eq(gallaTransactions.contactId, contactId),
        eq(gallaTransactions.isDeleted, false)
      )
    )
    .orderBy(desc(gallaTransactions.date), desc(gallaTransactions.createdAt));

  return { udhar, galla };
}

export async function createContact(
  data: Omit<NewContact, "id" | "createdAt" | "updatedAt">
) {
  const [contact] = await db.insert(contacts).values(data).returning();
  return contact;
}

export async function updateContact(
  id: string,
  data: Partial<Omit<NewContact, "id" | "createdAt" | "updatedAt">>
) {
  const [updated] = await db
    .update(contacts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(contacts.id, id))
    .returning();
  return updated;
}

export async function deleteContact(id: string) {
  return db
    .update(contacts)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(contacts.id, id));
}
