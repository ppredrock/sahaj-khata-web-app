"use client";

import * as React from "react";
import { Store, User, Phone, QrCode, MapPin, KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateProfileAction } from "@/app/actions";
import type { Profile } from "@/lib/types";

export function SettingsForm({ profile }: { profile: Profile }) {
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateProfileAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success("दुकान की जानकारी व सेटिंग्स सफलता पूर्वक अपडेट हो गई!");
    } else {
      toast.error("अपडेट करने में त्रुटि हुई।");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ─── Business Info Card ────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="p-4 pb-3 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <span>व्यापार व दुकान विवरण (Business Profile)</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="store-name">दुकान का नाम (Shop / Store Name) *</Label>
              <Input
                id="store-name"
                name="storeName"
                defaultValue={profile.storeName}
                required
                placeholder="उदा. शर्मा प्रोविजन स्टोर"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner-name">मालिक का नाम (Owner Name) *</Label>
              <Input
                id="owner-name"
                name="ownerName"
                defaultValue={profile.ownerName}
                required
                placeholder="उदा. राजेश शर्मा"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="store-phone">दुकान का संपर्क नंबर (Phone)</Label>
              <Input
                id="store-phone"
                name="phone"
                defaultValue={profile.phone || ""}
                type="tel"
                placeholder="उदा. 9876543210"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="store-upi">UPI ID (तगादा व भुगतान के लिए)</Label>
              <Input
                id="store-upi"
                name="upiId"
                defaultValue={profile.upiId || ""}
                placeholder="उदा. 9876543210@paytm या sharma@okhdfcbank"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="store-address">दुकान का पता (Address / Landmark)</Label>
            <Input
              id="store-address"
              name="address"
              defaultValue={profile.address || ""}
              placeholder="उदा. दुकान नंबर 12, मेन मार्केट, नई दिल्ली"
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Security PIN Card ────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="p-4 pb-3 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <span>सुरक्षा पिन (Dukandar Security PIN)</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="store-pin">नया 4-6 अंकों का पिन (PIN - Optional)</Label>
            <Input
              id="store-pin"
              name="pin"
              type="password"
              maxLength={6}
              placeholder={profile.pinHash ? "•••• (सुरक्षित पिन सेट है)" : "पिन सेट करने के लिए 4-6 अंक दर्ज करें"}
            />
            <p className="text-xs text-muted-foreground">
              पिन बदलने के लिए नया पिन डालें, अन्यथा इसे खाली छोड़ें।
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="gap-2 bg-primary text-primary-foreground font-semibold px-6"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? "सहेज रहे हैं..." : "जानकारी सहेजें (Save Settings)"}</span>
        </Button>
      </div>
    </form>
  );
}
