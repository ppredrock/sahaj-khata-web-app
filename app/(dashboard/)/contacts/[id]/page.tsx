import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Printer,
  CheckCircle2,
  Calendar,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContactById, getContactStatement } from "@/lib/queries/contacts";
import { getProfile } from "@/lib/queries/profile";
import { formatINR, formatDate } from "@/lib/utils";
import { generateWhatsAppReminderLink } from "@/lib/utils/whatsapp";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  const profile = await getProfile();
  const contact = await getContactById(id);

  if (!contact) {
    notFound();
  }

  const statement = await getContactStatement(id);

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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ─── Back Nav & Actions ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 no-print">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
          <Link href="/contacts">
            <ArrowLeft className="h-4 w-4" />
            <span>पार्टी सूची पर वापस</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {waLink && hasDue && (
            <Button
              size="sm"
              asChild
              className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>WhatsApp तगादा</span>
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="h-9 gap-1.5 text-xs"
            // We use inline window.print via client wrapper or script
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">प्रिंट पर्ची</span>
          </Button>
        </div>
      </div>

      {/* ─── Contact Passbook Header Card ─────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {contact.name}
                </h1>
                <Badge variant="outline" className="capitalize text-xs">
                  {contact.type}
                </Badge>
              </div>

              <div className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{contact.phone}</span>
                  </span>
                )}
                {contact.notes && <span>• {contact.notes}</span>}
              </div>
            </div>

            {/* Net Balance Status */}
            <div className="text-left sm:text-right p-3 sm:p-0 rounded-xl bg-muted/40 sm:bg-transparent">
              <div
                className={`text-2xl sm:text-3xl font-black ${
                  hasDue
                    ? "text-amber-600 dark:text-amber-400"
                    : isOwed
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {formatINR(absBalance)}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                {hasDue
                  ? "आपको लेना है (Aapko Lene Hain)"
                  : isOwed
                  ? "आपको देना है (Aapko Dene Hain)"
                  : "खाता चुक्ता (Nil Balance)"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Statement Ledger Table ────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="p-4 pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">
              खाता बही स्टेटमेंट (Passbook Statement)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {statement.udhar.length} लेन-देन दर्ज
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            दुकान: <span className="font-semibold text-foreground">{profile.storeName}</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {statement.udhar.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              इस खाते में अभी कोई लेन-देन दर्ज नहीं है।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                  <tr>
                    <th className="py-2.5 px-4">तारीख (Date)</th>
                    <th className="py-2.5 px-4">विवरण (Description)</th>
                    <th className="py-2.5 px-4 text-right">उधार दिया (Given)</th>
                    <th className="py-2.5 px-4 text-right">उधार मिला (Received)</th>
                    <th className="py-2.5 px-4 text-center">स्थिति (Status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {statement.udhar.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {entry.description || (entry.type === "given" ? "उधार दिया" : "जमा / वसूली")}
                        {entry.dueDate && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            देय तारीख: {formatDate(entry.dueDate)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        {entry.type === "given" ? formatINR(entry.amount) : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                        {entry.type === "received" ? formatINR(entry.amount) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {entry.settled ? (
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20">
                            चुक्ता
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            बाकी
                          </Badge>
                        )}
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
