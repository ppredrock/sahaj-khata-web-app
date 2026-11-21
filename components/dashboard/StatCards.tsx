import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Galla Inflow */}
      <Card className="border-border/60 shadow-xs hover:border-emerald-500/40 transition-colors">
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>आज का गल्ला (Inflow)</span>
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatINR(stats.todayInflow)}
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            बिक्री व अन्य नकद आमद
          </p>
        </CardContent>
      </Card>

      {/* 2. Galla Outflow */}
      <Card className="border-border/60 shadow-xs hover:border-rose-500/40 transition-colors">
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
            <span>आज का खर्चा (Outflow)</span>
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {formatINR(stats.todayOutflow)}
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            खर्च व भुगतानों का योग
          </p>
        </CardContent>
      </Card>

      {/* 3. Total Lena Hai */}
      <Card className="border-border/60 shadow-xs hover:border-amber-500/40 transition-colors">
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
            <span>आपको लेना है (Lena Hai)</span>
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {formatINR(stats.totalLenaHai)}
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            ग्राहकों पर बकाया उधार
          </p>
        </CardContent>
      </Card>

      {/* 4. Total Dena Hai */}
      <Card className="border-border/60 shadow-xs hover:border-blue-500/40 transition-colors">
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
            <span>आपको देना है (Dena Hai)</span>
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <TrendingDown className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            {formatINR(stats.totalDenaHai)}
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            सप्लायर या पार्टी को देनदारी
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
