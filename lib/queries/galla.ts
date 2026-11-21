import { db } from "@/lib/db/client";
import { gallaTransactions, dailyClosings } from "@/lib/db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import type { NewGallaTransaction, GallaTransaction } from "@/lib/types";
import { getTodayDateString } from "@/lib/utils";

export async function getGallaTransactions(params?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: "inflow" | "outflow";
  category?: string;
  limit?: number;
}): Promise<GallaTransaction[]> {
  const conditions = [eq(gallaTransactions.isDeleted, false)];

  if (params?.date) {
    conditions.push(eq(gallaTransactions.date, params.date));
  } else if (params?.startDate && params?.endDate) {
    conditions.push(
      and(
        gte(gallaTransactions.date, params.startDate),
        lte(gallaTransactions.date, params.endDate)
      )!
    );
  }

  if (params?.type) {
    conditions.push(eq(gallaTransactions.type, params.type));
  }

  if (params?.category) {
    conditions.push(eq(gallaTransactions.category, params.category as any));
  }

  let query = db
    .select()
    .from(gallaTransactions)
    .where(and(...conditions))
    .orderBy(desc(gallaTransactions.createdAt));

  if (params?.limit) {
    return query.limit(params.limit);
  }

  return query;
}

export async function getDayGallaSummary(dateStr: string = getTodayDateString()) {
  const entries = await db
    .select({
      type: gallaTransactions.type,
      amount: gallaTransactions.amount,
    })
    .from(gallaTransactions)
    .where(
      and(
        eq(gallaTransactions.date, dateStr),
        eq(gallaTransactions.isDeleted, false)
      )
    );

  let totalInflow = 0;
  let totalOutflow = 0;

  for (const entry of entries) {
    if (entry.type === "inflow") {
      totalInflow += entry.amount;
    } else {
      totalOutflow += entry.amount;
    }
  }

  return {
    date: dateStr,
    totalInflow,
    totalOutflow,
    net: totalInflow - totalOutflow,
    count: entries.length,
  };
}

export async function createGallaTransaction(
  data: Omit<NewGallaTransaction, "id" | "createdAt" | "updatedAt">
) {
  const result = await db.insert(gallaTransactions).values({
    ...data,
  }).returning();

  return result[0];
}

export async function deleteGallaTransaction(id: string) {
  return db
    .update(gallaTransactions)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(gallaTransactions.id, id));
}
