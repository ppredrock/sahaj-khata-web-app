import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { StatCards } from "@/components/dashboard/StatCards";
import { QuickActionModals } from "@/components/dashboard/QuickActionModals";
import { DailyClosingDialog } from "@/components/galla/DailyClosingDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { getGallaTransactions } from "@/lib/queries/galla";
import { getUdharTransactions } from "@/lib/queries/udhar";
import { getContactsWithBalance } from "@/lib/queries/contacts";
import { getExpectedClosingData } from "@/lib/queries/closing";
import { getProfile } from "@/lib/queries/profile";
import { formatINR, formatDate, getTodayDateString } from "@/lib/utils";

export default async function DashboardPage() {
  const today = getTodayDateString();
  const profile = await getProfile();
  const stats = await getDashboardStats();
  const closingData = await getExpectedClosingData(today);
  const contacts = await getContactsWithBalance();
  const recentGalla = await getGallaTransactions({ date: today, limit: 10 });
  const recentUdhar = await getUdharTransactions({ limit: 10 });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ─── Header & Date bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.storeName}
            </h1>
            <Badge variant="secondary" className="text-xs font-medium">
              {profile.ownerName}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>आज: {formatDate(today)}</span>
            <span>•</span>
            <span className="font-medium text-foreground">
              {stats.closingStatus === "closed" ? "दुकान रोकड़ बंद (Closed)" : "दुकान रोकड़ चालू (Open)"}
            </span>
          </p>
        </div>

        {/* Daily Closing Dialog Trigger */}
        <div className="flex items-center gap-2">
          <DailyClosingDialog closingData={closingData} />
        </div>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────────────────── */}
      <StatCards stats={stats} />

      {/* ─── Quick Action Modals ────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          त्वरित प्रविष्टि (Quick Entries)
        </div>
        <QuickActionModals contacts={contacts} />
      </div>

      {/* ─── Two Column Layout: Today's Galla & Pending Udhar ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Galla Cashbook */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>आज का गल्ला खाता (Today&apos;s Galla)</span>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {recentGalla.length} लेन-देन
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                नकद आमद व खर्चे का दैनिक ब्योरा
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8 gap-1">
              <Link href="/galla">
                <span>पूरा देखें</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {recentGalla.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
                आज अभी तक कोई गल्ला प्रविष्टि नहीं की गई है।
                <div className="text-xs mt-1">ऊपर दिए गए &quot;+ नकद आमद&quot; या &quot;+ नकद खर्चा&quot; पर क्लिक करें।</div>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentGalla.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-2.5 flex items-center justify-between text-sm"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-foreground truncate">
                        {tx.description || (tx.type === "inflow" ? "नकद बिक्री" : "दुकान खर्च")}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize">{tx.category || tx.type}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px]">{tx.paymentMode}</span>
                      </div>
                    </div>
                    <div
                      className={`text-right font-bold shrink-0 ${
                        tx.type === "inflow"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.type === "inflow" ? "+" : "-"}
                      {formatINR(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Udhar (Khata) */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>हाल का उधार खाता (Recent Udhar)</span>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {recentUdhar.length} खाते
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                ग्राहकों व पार्टियों का लेन-देन
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8 gap-1">
              <Link href="/udhar">
                <span>पूरा खाता</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {recentUdhar.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
                अभी कोई उधार खाता प्रविष्टि नहीं है।
                <div className="text-xs mt-1">&quot;+ उधार दिया&quot; या &quot;+ उधार मिला&quot; से शुरुआत करें।</div>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentUdhar.map((u) => (
                  <div
                    key={u.id}
                    className="py-2.5 flex items-center justify-between text-sm"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                        <span>{u.contactName}</span>
                        {u.settled && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-normal">
                            चुक्ता
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {u.description || (u.type === "given" ? "उधार दिया" : "उधार मिला")} • {formatDate(u.date)}
                      </div>
                    </div>
                    <div
                      className={`text-right font-bold shrink-0 ${
                        u.type === "given"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {u.type === "given" ? "लेना: " : "मिला: "}
                      {formatINR(u.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
