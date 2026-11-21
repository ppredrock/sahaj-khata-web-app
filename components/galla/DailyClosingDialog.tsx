"use client";

import * as React from "react";
import { Lock, CheckCircle2, AlertTriangle, Calculator, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { closeRegisterAction } from "@/app/actions";
import { formatINR } from "@/lib/utils";

interface DailyClosingDialogProps {
  closingData: {
    date: string;
    openingBalance: number;
    totalInflow: number;
    totalOutflow: number;
    expectedBalance: number;
    isClosed: boolean;
    currentClosing?: any;
  };
}

export function DailyClosingDialog({ closingData }: DailyClosingDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [actualCash, setActualCash] = React.useState<string>(
    closingData.currentClosing?.actualBalance !== undefined && closingData.currentClosing?.actualBalance !== null
      ? String(closingData.currentClosing.actualBalance)
      : ""
  );
  const [note, setNote] = React.useState(closingData.currentClosing?.mismatchNote || "");
  const [loading, setLoading] = React.useState(false);

  const parsedActual = parseFloat(actualCash);
  const hasEnteredActual = !isNaN(parsedActual);
  const mismatch = hasEnteredActual ? parsedActual - closingData.expectedBalance : 0;

  async function handleCloseRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!hasEnteredActual) {
      toast.error("कृपया गल्ले में मौजूद वास्तविक नकद राशि दर्ज करें।");
      return;
    }

    setLoading(true);
    const res = await closeRegisterAction({
      date: closingData.date,
      openingBalance: closingData.openingBalance,
      totalInflow: closingData.totalInflow,
      totalOutflow: closingData.totalOutflow,
      expectedBalance: closingData.expectedBalance,
      actualBalance: parsedActual,
      mismatchNote: note,
    });
    setLoading(false);

    if (res.success) {
      toast.success("दैनिक रोकड़ सफलता पूर्वक बंद हो गया!");
      setOpen(false);
    } else {
      toast.error("रोकड़ बंद करने में त्रुटि हुई।");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={closingData.isClosed ? "outline" : "default"}
          className={`h-9 gap-2 text-xs sm:text-sm font-semibold ${
            closingData.isClosed
              ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {closingData.isClosed ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>आज का गल्ला बंद (Closed)</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>दैनिक रोकड़ बंद करें (Daily Closing)</span>
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </span>
            <span>दैनिक रोकड़ मिलान (Daily Cash Reconciliation)</span>
          </DialogTitle>
          <DialogDescription>
            दिन के अंत में गल्ले में रखी कुल नकद राशि का हिसाब मिलाएं।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCloseRegister} className="space-y-4">
          {/* Breakdown Box */}
          <div className="rounded-xl border bg-muted/40 p-4 space-y-2.5 text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>शुरुआती रोकड़ (Opening Balance):</span>
              <span className="font-semibold text-foreground">
                {formatINR(closingData.openingBalance)}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
              <span>+ आज की कुल नकद आमद (Inflow):</span>
              <span className="font-semibold">
                +{formatINR(closingData.totalInflow)}
              </span>
            </div>
            <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
              <span>- आज का कुल नकद खर्चा (Outflow):</span>
              <span className="font-semibold">
                -{formatINR(closingData.totalOutflow)}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center font-bold text-base">
              <span>गल्ले में अपेक्षित नकद (Expected Cash):</span>
              <span className="text-primary text-lg">
                {formatINR(closingData.expectedBalance)}
              </span>
            </div>
          </div>

          {/* Actual Cash Input */}
          <div className="space-y-1.5">
            <Label htmlFor="actual-cash">गल्ले में वास्तविक मौजूद नकद (Physical Cash in Drawer) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-lg font-bold text-muted-foreground">
                ₹
              </span>
              <Input
                id="actual-cash"
                type="number"
                step="any"
                min="0"
                required
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="गिनकर कुल नकद दर्ज करें..."
                className="pl-8 text-xl font-bold"
                autoFocus
              />
            </div>
          </div>

          {/* Live Mismatch Feedback */}
          {hasEnteredActual && (
            <div
              className={`p-3 rounded-lg border text-sm flex items-start gap-2.5 ${
                mismatch === 0
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : mismatch > 0
                  ? "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300"
                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
              }`}
            >
              {mismatch === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">हिसाब बिल्कुल सही है!</div>
                    <div className="text-xs">
                      गल्ले का अपेक्षित नकद और वास्तविक नकद 100% मिलान हो चुका है।
                    </div>
                  </div>
                </>
              ) : mismatch > 0 ? (
                <>
                  <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">फालतू नकद: +{formatINR(mismatch)}</div>
                    <div className="text-xs">
                      वास्तविक नकद हिसाब से अधिक है (Surplus)।
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">नकद कम है: {formatINR(mismatch)}</div>
                    <div className="text-xs">
                      वास्तविक नकद हिसाब से कम है (Shortage)। कोई प्रविष्टि छूट तो नहीं गई?
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Note Input */}
          <div className="space-y-1.5">
            <Label htmlFor="mismatch-note">अंतर का कारण / टिप्पणी (Note - Optional)</Label>
            <Input
              id="mismatch-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="उदा. ₹20 खुले सिक्कों का अंतर या अतिरिक्त जमा"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              रद्द करें
            </Button>
            <Button
              type="submit"
              disabled={loading || !hasEnteredActual}
              className="bg-primary text-primary-foreground font-semibold"
            >
              {loading ? "बंद कर रहे हैं..." : "रोकड़ बंद करें (Confirm & Close)"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
