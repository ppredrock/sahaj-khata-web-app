"use client";

import * as React from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, BookOpen, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addGallaAction, addUdharAction } from "@/app/actions";
import type { Contact } from "@/lib/types";

interface QuickActionModalsProps {
  contacts: Contact[];
}

export function QuickActionModals({ contacts }: QuickActionModalsProps) {
  const [modalType, setModalType] = React.useState<
    "cash_in" | "cash_out" | "udhar_given" | "udhar_received" | null
  >(null);
  const [loading, setLoading] = React.useState(false);
  const [isNewContact, setIsNewContact] = React.useState(false);

  const closeModal = () => {
    setModalType(null);
    setIsNewContact(false);
  };

  async function handleGallaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addGallaAction(formData);
    setLoading(false);
    if (res.success) {
      toast.success(
        modalType === "cash_in"
          ? "गल्ला आमद (Cash In) दर्ज कर ली गई!"
          : "खर्चा (Cash Out) दर्ज कर लिया गया!"
      );
      closeModal();
    } else {
      toast.error(res.error || "त्रुटि हुई, कृपया पुनः प्रयास करें।");
    }
  }

  async function handleUdharSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addUdharAction(formData);
    setLoading(false);
    if (res.success) {
      toast.success(
        modalType === "udhar_given"
          ? "उधार दिया (Udhar Given) खाते में दर्ज!"
          : "उधार मिला (Udhar Received) खाते में दर्ज!"
      );
      closeModal();
    } else {
      toast.error(res.error || "त्रुटि हुई, कृपया पुनः प्रयास करें।");
    }
  }

  return (
    <>
      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* + Cash In */}
        <Button
          onClick={() => setModalType("cash_in")}
          className="h-auto py-3 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
        >
          <ArrowDownLeft className="h-5 w-5 shrink-0" />
          <div className="text-center sm:text-left">
            <div className="text-sm font-bold leading-tight">+ नकद आमद</div>
            <div className="text-[11px] opacity-85 font-normal">Cash In (बिक्री)</div>
          </div>
        </Button>

        {/* + Cash Out */}
        <Button
          onClick={() => setModalType("cash_out")}
          variant="outline"
          className="h-auto py-3 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium shadow-xs"
        >
          <ArrowUpRight className="h-5 w-5 shrink-0" />
          <div className="text-center sm:text-left">
            <div className="text-sm font-bold leading-tight">+ नकद खर्चा</div>
            <div className="text-[11px] opacity-85 font-normal">Cash Out (खर्च)</div>
          </div>
        </Button>

        {/* + Udhar Given */}
        <Button
          onClick={() => setModalType("udhar_given")}
          variant="outline"
          className="h-auto py-3 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium shadow-xs"
        >
          <BookOpen className="h-5 w-5 shrink-0" />
          <div className="text-center sm:text-left">
            <div className="text-sm font-bold leading-tight">+ उधार दिया</div>
            <div className="text-[11px] opacity-85 font-normal">Udhar Given</div>
          </div>
        </Button>

        {/* + Udhar Received */}
        <Button
          onClick={() => setModalType("udhar_received")}
          variant="outline"
          className="h-auto py-3 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 border-blue-300 dark:border-blue-900 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-medium shadow-xs"
        >
          <ArrowDownLeft className="h-5 w-5 shrink-0" />
          <div className="text-center sm:text-left">
            <div className="text-sm font-bold leading-tight">+ उधार मिला</div>
            <div className="text-[11px] opacity-85 font-normal">Udhar Wapsi</div>
          </div>
        </Button>
      </div>

      {/* ─── Cash In / Out Dialog ─────────────────────────────────────── */}
      <Dialog
        open={modalType === "cash_in" || modalType === "cash_out"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {modalType === "cash_in" ? (
                <>
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <ArrowDownLeft className="h-5 w-5" />
                  </span>
                  <span>नकद आमद दर्ज करें (Cash In)</span>
                </>
              ) : (
                <>
                  <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                  <span>नकद खर्चा दर्ज करें (Cash Out)</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {modalType === "cash_in"
                ? "गल्ले में आई नकद राशि या बिक्री दर्ज करें।"
                : "गल्ले से किया गया दुकान का खर्च या भुगतान दर्ज करें।"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGallaSubmit} className="space-y-4">
            <input
              type="hidden"
              name="type"
              value={modalType === "cash_in" ? "inflow" : "outflow"}
            />

            <div className="space-y-1.5">
              <Label htmlFor="galla-amount">राशि (Amount in ₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-lg font-bold text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="galla-amount"
                  name="amount"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  autoFocus
                  className="pl-8 text-xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="galla-category">कैटेगरी (Category)</Label>
              <select
                id="galla-category"
                name="category"
                defaultValue={modalType === "cash_in" ? "sale" : "expense"}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {modalType === "cash_in" ? (
                  <>
                    <option value="sale">दुकान की बिक्री (Daily Sale)</option>
                    <option value="other">अन्य आमद (Other Inflow)</option>
                  </>
                ) : (
                  <>
                    <option value="expense">दुकान का खर्च (Shop Expense / Tea / Rent)</option>
                    <option value="purchase">माल खरीद (Stock Purchase)</option>
                    <option value="other">अन्य खर्च (Other Outflow)</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="galla-description">विवरण / नोट (Description)</Label>
              <Input
                id="galla-description"
                name="description"
                placeholder={
                  modalType === "cash_in"
                    ? "उदा. किराना सामान नकद बिक्री"
                    : "उदा. चाय-नाश्ता, बिजली बिल, माल भाड़ा"
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="galla-mode">भुगतान माध्यम (Mode)</Label>
              <select
                id="galla-mode"
                name="paymentMode"
                defaultValue="cash"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="cash">नकद (Cash Drawer)</option>
                <option value="upi">UPI / QR कोड (PhonePe/GPay)</option>
                <option value="bank">बैंक ट्रांसफर (Bank Account)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                रद्द करें
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={
                  modalType === "cash_in"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }
              >
                {loading ? "सहेज रहे हैं..." : "सहेजें (Save)"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Udhar Given / Received Dialog ────────────────────────────── */}
      <Dialog
        open={modalType === "udhar_given" || modalType === "udhar_received"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className={`p-1.5 rounded-lg ${
                  modalType === "udhar_given"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-blue-500/10 text-blue-600"
                }`}
              >
                <BookOpen className="h-5 w-5" />
              </span>
              <span>
                {modalType === "udhar_given"
                  ? "उधार दिया (Udhar Given)"
                  : "उधार मिला / वसूली (Udhar Received)"}
              </span>
            </DialogTitle>
            <DialogDescription>
              {modalType === "udhar_given"
                ? "ग्राहक को दिया गया माल या उधार खाते में जोड़ें।"
                : "ग्राहक से मिली बकाया राशि या वसूली दर्ज करें।"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUdharSubmit} className="space-y-4">
            <input
              type="hidden"
              name="type"
              value={modalType === "udhar_given" ? "given" : "received"}
            />

            {/* Select Contact or Add New */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="udhar-contact">पार्टी / ग्राहक (Party / Contact) *</Label>
                <button
                  type="button"
                  onClick={() => setIsNewContact(!isNewContact)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {isNewContact ? "सूची से चुनें" : "+ नया ग्राहक/पार्टी"}
                </button>
              </div>

              {isNewContact ? (
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
                  <Input
                    name="newContactName"
                    required
                    placeholder="ग्राहक / पार्टी का नाम *"
                  />
                  <Input
                    name="newContactPhone"
                    type="tel"
                    placeholder="मोबाइल नंबर (WhatsApp के लिए 10 अंक)"
                  />
                  <input type="hidden" name="contactId" value="new" />
                </div>
              ) : (
                <select
                  id="udhar-contact"
                  name="contactId"
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">-- ग्राहक या पार्टी चुनें --</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""} [{c.type}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="udhar-amount">उधार राशि (Amount in ₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-lg font-bold text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="udhar-amount"
                  name="amount"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  autoFocus
                  className="pl-8 text-xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="udhar-desc">विवरण / सामान की पर्ची (Description)</Label>
              <Input
                id="udhar-desc"
                name="description"
                placeholder="उदा. 5kg आटा, तेल, साबुन"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="udhar-due">भुगतान की तारीख (Due Date - Optional)</Label>
              <Input id="udhar-due" name="dueDate" type="date" />
            </div>

            {/* Sync to Galla Option */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="syncToGalla"
                name="syncToGalla"
                value="true"
                defaultChecked={modalType === "udhar_received"}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="syncToGalla" className="text-xs cursor-pointer text-muted-foreground font-normal">
                {modalType === "udhar_received"
                  ? "नकद मिला है - गल्ले में आमद (Cash Inflow) भी स्वतः दर्ज करें"
                  : "नकद से दिया है - गल्ले से खर्चा (Cash Outflow) भी स्वतः दर्ज करें"}
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                रद्द करें
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={
                  modalType === "udhar_given"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              >
                {loading ? "सहेज रहे हैं..." : "सहेजें (Save)"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
