"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  CheckCircle2,
  Phone,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { settleUdharAction } from "@/app/actions";
import { generateWhatsAppReminderLink } from "@/lib/utils/whatsapp";
import { formatINR, formatDate } from "@/lib/utils";
import type { ContactWithBalance } from "@/lib/types";

interface UdharListClientProps {
  contacts: ContactWithBalance[];
  unsettledTransactions: any[];
  storeName: string;
  upiId?: string | null;
}

export function UdharListClient({
  contacts,
  unsettledTransactions,
  storeName,
  upiId,
}: UdharListClientProps) {
  const [tab, setTab] = React.useState<"customers" | "suppliers" | "all">("customers");
  const [search, setSearch] = React.useState("");
  const [settlingId, setSettlingId] = React.useState<string | null>(null);

  // Filter contacts based on active tab and search query
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));

    if (!matchesSearch) return false;

    if (tab === "customers") {
      return c.type === "customer" || c.netBalance > 0;
    }
    if (tab === "suppliers") {
      return c.type === "supplier" || c.netBalance < 0;
    }
    return true;
  });

  async function handleSettle(txId: string) {
    setSettlingId(txId);
    const res = await settleUdharAction(txId, true);
    setSettlingId(null);
    if (res.success) {
      toast.success("उधार चुकता दर्ज किया गया और गल्ले में हिसाब जुड़ गया!");
    } else {
      toast.error("चुकता करने में त्रुटि हुई।");
    }
  }

  return (
    <div className="space-y-4">
      {/* ─── Search & Tab Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="inline-flex rounded-lg bg-muted p-1 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setTab("customers")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === "customers"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ग्राहक खाता (Customers)
          </button>
          <button
            onClick={() => setTab("suppliers")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === "suppliers"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            सप्लायर खाता (Suppliers)
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              tab === "all"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            सभी पार्टियां (All)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम या मोबाइल से खोजें..."
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* ─── Contact Cards List ───────────────────────────────────────── */}
      {filteredContacts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
          कोई खाता नहीं मिला।
          {search && <div className="text-xs mt-1">&quot;{search}&quot; से मेल खाती कोई पार्टी नहीं है।</div>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredContacts.map((contact) => {
            const hasDue = contact.netBalance > 0;
            const isOwed = contact.netBalance < 0;
            const absBalance = Math.abs(contact.netBalance);

            // WhatsApp Reminder Link
            const waLink = contact.phone
              ? generateWhatsAppReminderLink({
                  phone: contact.phone,
                  customerName: contact.name,
                  storeName,
                  amount: absBalance,
                  upiId,
                })
              : null;

            return (
              <Card
                key={contact.id}
                className="border-border/70 hover:border-border transition-colors shadow-xs"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="font-bold text-base hover:text-primary hover:underline flex items-center gap-1.5 truncate"
                      >
                        <span>{contact.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] font-normal capitalize">
                          {contact.type}
                        </Badge>
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Balance Badge */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-lg font-black ${
                          hasDue
                            ? "text-amber-600 dark:text-amber-400"
                            : isOwed
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatINR(absBalance)}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {hasDue
                          ? "लेना है (To Collect)"
                          : isOwed
                          ? "देना है (To Pay)"
                          : "हिसाब चुक्ता"}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs px-2.5">
                      <Link href={`/contacts/${contact.id}`}>खाता बही (Passbook)</Link>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp Reminder (Only if balance > 0 and has phone) */}
                      {hasDue && waLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 text-xs gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          <a href={waLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-3.5 w-3.5 fill-current" />
                            <span>तगादा भेजें (WhatsApp)</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
