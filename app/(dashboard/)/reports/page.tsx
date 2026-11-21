import Link from "next/link";
import { Download, FileBarChart, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { getContactsWithBalance } from "@/lib/queries/contacts";
import { getGallaTransactions } from "@/lib/queries/galla";
import { formatINR, getTodayDateString } from "@/lib/utils";

export default async function ReportsPage() {
  const stats = await getDashboardStats();
  const contacts = await getContactsWithBalance();
  const today = getTodayDateString();
  const allGalla = await getGallaTransactions({ limit: 50 });

  // Calculate category aggregates
  const categoryMap: Record<string, number> = {};
  for (const g of allGalla) {
    const cat = g.category || "other";
    categoryMap[cat] = (categoryMap[cat] || 0) + g.amount;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <span>रिपोर्ट्स व बैकअप (Reports & Backup)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            वित्तीय विश्लेषण, श्रेणीवार खर्च और डेटा बैकअप
          </p>
        </div>

        <Button asChild size="sm" className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold">
          <a href="/api/export" download>
            <Download className="h-4 w-4" />
            <span>बैकअप डाउनलोड (Export JSON)</span>
          </a>
        </Button>
      </div>

      {/* ─── Balance Summary ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              आज की आमद (Inflow)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatINR(stats.todayInflow)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              आज का खर्च (Outflow)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatINR(stats.todayOutflow)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              कुल बकाया लेना है (Receivable)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatINR(stats.totalLenaHai)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              कुल बकाया देना है (Payable)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatINR(stats.totalDenaHai)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Category Breakdown ────────────────────────────────────────── */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="p-4 pb-3 border-b">
          <CardTitle className="text-base font-bold">
            कैटेगरी अनुसार गल्ला विभाजन (Category Breakdown)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            हाल के 50 लेन-देन का विश्लेषण
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border bg-muted/30">
              <div className="text-xs text-muted-foreground">बिक्री (Sales)</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">
                {formatINR(categoryMap["sale"] || 0)}
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <div className="text-xs text-muted-foreground">माल खरीद (Purchases)</div>
              <div className="text-lg font-bold text-rose-600 mt-1">
                {formatINR(categoryMap["purchase"] || 0)}
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <div className="text-xs text-muted-foreground">दुकान खर्च (Expenses)</div>
              <div className="text-lg font-bold text-amber-600 mt-1">
                {formatINR(categoryMap["expense"] || 0)}
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <div className="text-xs text-muted-foreground">अन्य (Other)</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {formatINR(categoryMap["other"] || 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
