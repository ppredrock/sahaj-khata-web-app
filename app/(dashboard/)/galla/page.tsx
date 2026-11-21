import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Calendar, Filter, Plus } from "lucide-react";
import { DailyClosingDialog } from "@/components/galla/DailyClosingDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGallaTransactions, getDayGallaSummary } from "@/lib/queries/galla";
import { getExpectedClosingData } from "@/lib/queries/closing";
import { formatINR, formatDate, getTodayDateString } from "@/lib/utils";

interface GallaPageProps {
  searchParams: Promise<{ date?: string; type?: "inflow" | "outflow" }>;
}

export default async function GallaPage({ searchParams }: GallaPageProps) {
  const { date: paramDate, type: paramType } = await searchParams;
  const selectedDate = paramDate || getTodayDateString();

  const transactions = await getGallaTransactions({
    date: selectedDate,
    type: paramType,
  });
  const summary = await getDayGallaSummary(selectedDate);
  const closingData = await getExpectedClosingData(selectedDate);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ─── Header & Date bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <span>गल्ला खाता (Cash Book)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            दैनिक नकद बिक्री, खर्च व रोकड़ का पूरा हिसाब
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker Form */}
          <form method="GET" className="flex items-center gap-2">
            <input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="h-9 px-3 text-xs sm:text-sm rounded-lg border border-input bg-background font-medium"
            />
            <Button type="submit" variant="outline" size="sm" className="h-9 text-xs">
              बदलें
            </Button>
          </form>

          {/* Daily Closing Dialog */}
          <DailyClosingDialog closingData={closingData} />
        </div>
      </div>

      {/* ─── Day Cash Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <Card className="border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <span>कुल नकद आमद (Inflow)</span>
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatINR(summary.totalInflow)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              बिक्री व नकद आवक
            </div>
          </CardContent>
        </Card>

        {/* Total Outflow */}
        <Card className="border-rose-200 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              <span>कुल नकद खर्चा (Outflow)</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              -{formatINR(summary.totalOutflow)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              दुकान खर्च व भुगतान
            </div>
          </CardContent>
        </Card>

        {/* Net Cash Balance */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>आज का शुद्ध नकद (Net Flow)</span>
              <span className="font-bold">{summary.count} प्रविष्टियां</span>
            </div>
            <div
              className={`text-2xl font-black mt-1 ${
                summary.net >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {summary.net >= 0 ? "+" : ""}
              {formatINR(summary.net)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Inflow घटाव Outflow
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Transactions List ─────────────────────────────────────────── */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">
              लेन-देन सूची ({formatDate(selectedDate)})
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {transactions.length} प्रविष्टियां दर्ज हैं
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <Button
              variant={!paramType ? "secondary" : "ghost"}
              size="sm"
              asChild
              className="h-7 text-xs"
            >
              <Link href={`/galla?date=${selectedDate}`}>सब</Link>
            </Button>
            <Button
              variant={paramType === "inflow" ? "secondary" : "ghost"}
              size="sm"
              asChild
              className="h-7 text-xs text-emerald-600"
            >
              <Link href={`/galla?date=${selectedDate}&type=inflow`}>आमद (+)</Link>
            </Button>
            <Button
              variant={paramType === "outflow" ? "secondary" : "ghost"}
              size="sm"
              asChild
              className="h-7 text-xs text-rose-600"
            >
              <Link href={`/galla?date=${selectedDate}&type=outflow`}>खर्चा (-)</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              इस तारीख ({formatDate(selectedDate)}) पर कोई गल्ला प्रविष्टि नहीं मिली।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-y">
                  <tr>
                    <th className="py-2.5 px-4">विवरण (Description)</th>
                    <th className="py-2.5 px-4">कैटेगरी (Category)</th>
                    <th className="py-2.5 px-4">माध्यम (Mode)</th>
                    <th className="py-2.5 px-4 text-right">राशि (Amount)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        {tx.description || (tx.type === "inflow" ? "नकद आमद / बिक्री" : "दुकान खर्च")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs font-normal capitalize">
                          {tx.category || tx.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 uppercase text-xs text-muted-foreground">
                        {tx.paymentMode}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          tx.type === "inflow"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {tx.type === "inflow" ? "+" : "-"}
                        {formatINR(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
