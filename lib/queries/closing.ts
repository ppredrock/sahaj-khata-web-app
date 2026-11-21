import { db } from "@/lib/db/client";
import { dailyClosings, gallaTransactions } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getTodayDateString } from "@/lib/utils";
import { getDayGallaSummary } from "./galla";

export async function getDailyClosing(dateStr: string = getTodayDateString()) {
  const [closing] = await db
    .select()
    .from(dailyClosings)
    .where(eq(dailyClosings.date, dateStr));

  return closing || null;
}

export async function getExpectedClosingData(dateStr: string = getTodayDateString()) {
  const summary = await getDayGallaSummary(dateStr);

  // Find previous day's closing to use as opening balance
  const [prevClosing] = await db
    .select()
    .from(dailyClosings)
    .where(sql`${dailyClosings.date} < ${dateStr}`)
    .orderBy(desc(dailyClosings.date))
    .limit(1);

  const openingBalance = prevClosing?.actualBalance ?? prevClosing?.expectedBalance ?? 0;
  const expectedBalance = openingBalance + summary.totalInflow - summary.totalOutflow;

  const currentClosing = await getDailyClosing(dateStr);

  return {
    date: dateStr,
    openingBalance,
    totalInflow: summary.totalInflow,
    totalOutflow: summary.totalOutflow,
    expectedBalance,
    currentClosing,
    isClosed: currentClosing?.status === "closed",
  };
}

export async function saveDailyClosing(data: {
  date: string;
  openingBalance: number;
  totalInflow: number;
  totalOutflow: number;
  expectedBalance: number;
  actualBalance: number;
  mismatchNote?: string;
}) {
  const mismatch = data.actualBalance - data.expectedBalance;

  const existing = await getDailyClosing(data.date);

  if (existing) {
    const [updated] = await db
      .update(dailyClosings)
      .set({
        openingBalance: data.openingBalance,
        totalInflow: data.totalInflow,
        totalOutflow: data.totalOutflow,
        expectedBalance: data.expectedBalance,
        actualBalance: data.actualBalance,
        mismatch,
        mismatchNote: data.mismatchNote,
        status: "closed",
        closedAt: new Date(),
      })
      .where(eq(dailyClosings.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(dailyClosings)
    .values({
      date: data.date,
      openingBalance: data.openingBalance,
      totalInflow: data.totalInflow,
      totalOutflow: data.totalOutflow,
      expectedBalance: data.expectedBalance,
      actualBalance: data.actualBalance,
      mismatch,
      mismatchNote: data.mismatchNote,
      status: "closed",
      closedAt: new Date(),
    })
    .returning();

  return created;
}
