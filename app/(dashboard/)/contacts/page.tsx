import Link from "next/link";
import { Users, Phone, ArrowRight, MessageCircle } from "lucide-react";
import { AddContactDialog } from "@/components/contacts/AddContactDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getContactsWithBalance } from "@/lib/queries/contacts";
import { getProfile } from "@/lib/queries/profile";
import { formatINR } from "@/lib/utils";
import { generateWhatsAppReminderLink } from "@/lib/utils/whatsapp";

export default async function ContactsPage() {
  const profile = await getProfile();
  const contacts = await getContactsWithBalance();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <span>पार्टी डायरेक्टरी (Parties & Contacts)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            सभी ग्राहकों और सप्लायरों की सूची व बकाया हिसाब
          </p>
        </div>

        <AddContactDialog />
      </div>

      {/* ─── Contacts Directory Grid ──────────────────────────────────── */}
      {contacts.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
          कोई पार्टी अभी नहीं जुड़ी है।
          <div className="text-xs mt-1">ऊपर दिए गए &quot;+ नई पार्टी जोड़ें&quot; बटन से ग्राहक या व्यापारी जोड़ें।</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => {
            const hasDue = contact.netBalance > 0;
            const isOwed = contact.netBalance < 0;
            const absBalance = Math.abs(contact.netBalance);
            const waLink = contact.phone
              ? generateWhatsAppReminderLink({
                  phone: contact.phone,
                  customerName: contact.name,
                  storeName: profile.storeName,
                  amount: absBalance,
                  upiId: profile.upiId,
                })
              : null;

            return (
              <Card key={contact.id} className="border-border/70 hover:border-border transition-colors shadow-xs">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="font-bold text-base hover:text-primary hover:underline flex items-center gap-1.5"
                      >
                        {contact.name}
                      </Link>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] capitalize font-normal">
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

                    <div className="text-right">
                      <div
                        className={`text-base font-bold ${
                          hasDue
                            ? "text-amber-600 dark:text-amber-400"
                            : isOwed
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatINR(absBalance)}
                      </div>
                      <div className="text-[10px] font-semibold text-muted-foreground">
                        {hasDue ? "लेना है" : isOwed ? "देना है" : "चुकता"}
                      </div>
                    </div>
                  </div>

                  {contact.notes && (
                    <p className="text-xs text-muted-foreground italic truncate">
                      {contact.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs gap-1">
                      <Link href={`/contacts/${contact.id}`}>
                        <span>खाता देखें</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>

                    {contact.phone && hasDue && waLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs text-emerald-600 border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1.5"
                      >
                        <a href={waLink} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-3.5 w-3.5 fill-current" />
                          <span>WhatsApp तगादा</span>
                        </a>
                      </Button>
                    )}
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
