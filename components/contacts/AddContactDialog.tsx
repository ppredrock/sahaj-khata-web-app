"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
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
import { addContactAction } from "@/app/actions";

export function AddContactDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addContactAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success("नई पार्टी / ग्राहक खाते में जोड़ लिया गया!");
      setOpen(false);
    } else {
      toast.error(res.error || "त्रुटि हुई, कृपया पुनः प्रयास करें।");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 gap-1.5 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground">
          <UserPlus className="h-4 w-4" />
          <span>+ नई पार्टी जोड़ें</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </span>
            <span>नई पार्टी / ग्राहक जोड़ें (Add Contact)</span>
          </DialogTitle>
          <DialogDescription>
            दुकान से जुड़े नए ग्राहक, सप्लायर या व्यापारी का विवरण दर्ज करें।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="party-name">पार्टी का नाम (Name) *</Label>
            <Input
              id="party-name"
              name="name"
              required
              placeholder="उदा. रमेश कुमार / गुप्ता किराना"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="party-phone">मोबाइल नंबर (WhatsApp Phone)</Label>
            <Input
              id="party-phone"
              name="phone"
              type="tel"
              placeholder="10 अंकों का मोबाइल नंबर"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="party-type">पार्टी का प्रकार (Type)</Label>
            <select
              id="party-type"
              name="type"
              defaultValue="customer"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="customer">ग्राहक (Customer)</option>
              <option value="supplier">सप्लायर / व्यापारी (Supplier)</option>
              <option value="both">दोनों (Both)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="party-notes">पता या विशेष नोट (Notes)</Label>
            <Input
              id="party-notes"
              name="notes"
              placeholder="उदा. गली नंबर 3, मकान 45"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              रद्द करें
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground font-semibold">
              {loading ? "जोड़ रहे हैं..." : "खाता बनाएं (Save Party)"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
