import { BookOpen, UserPlus } from "lucide-react";
import { UdharListClient } from "@/components/udhar/UdharListClient";
import { QuickActionModals } from "@/components/dashboard/QuickActionModals";
import { getContactsWithBalance } from "@/lib/queries/contacts";
import { getUdharTransactions } from "@/lib/queries/udhar";
import { getProfile } from "@/lib/queries/profile";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { formatINR } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default async function UdharPage() {
  const profile = await getProfile();
  const contacts = await getContactsWithBalance();
  const unsettled = await getUdharTransactions({ settled: false });
  const stats = await getDashboardStats();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <span>उधार खाता बही (Udhar Khata)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            ग्राहकों और सप्लायरों की बकाया राशि, वसूली और WhatsApp तगादा
          </p>
        </div>

        {/* Quick Udhar Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">
            <span className="opacity-80">कुल लेना है: </span>
            <span className="font-bold">{formatINR(stats.totalLenaHai)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs">
            <span className="opacity-80">कुल देना है: </span>
            <span className="font-bold">{formatINR(stats.totalDenaHai)}</span>
          </div>
        </div>
      </div>

      {/* ─── Quick Udhar Buttons ───────────────────────────────────────── */}
      <QuickActionModals contacts={contacts} />

      {/* ─── Udhar List with Search, Tabs and WhatsApp Reminder ────────── */}
      <UdharListClient
        contacts={contacts}
        unsettledTransactions={unsettled}
        storeName={profile.storeName}
        upiId={profile.upiId}
      />
    </div>
  );
}
