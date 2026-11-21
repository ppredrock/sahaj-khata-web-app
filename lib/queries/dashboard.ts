import { db } from "@/lib/db/client";
import { gallaTransactions, udharTransactions, dailyClosings } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getTodayDateString } from "@/lib/utils";
import { getDayGallaSummary } from "./galla";
import { getDailyClosing } from "./closing";

export async function getDashboardStats() {
  const today = getTodayDateString();
  const summary = await getDayGallaSummary(today);
  const closing = await getDailyClosing(today);

  // Unsettled Udhar
  const unsettledUdhar = await db
    .select({
      type: udharTransactions.type,
      amount: udharTransactions.amount,
    })
    .from(udharTransactions)
    .where(
      and(
        eq(udharTransactions.isDeleted, false),
        eq(udharTransactions.settled, false)
      )
    );

  let totalLenaHai = 0; // Customer owes you (given)
  let totalDenaHai = 0; // You owe someone (received)

  for (const u of unsettledUdhar) {
    if (u.type === "given") {
      totalLenaHai += u.amount;
    } else {
      totalDenaHai += u.amount;
    }
  }

  return {
    todayInflow: summary.totalInflow,
    todayOutflow: summary.totalOutflow,
    todayNet: summary.net,
    totalLenaHai,
    totalDenaHai,
    closingStatus: closing?.status || ("open" as const),
    expectedClosingBalance: summary.net,
  };
}
