import { SettingsForm } from "@/components/settings/SettingsForm";
import { getProfile } from "@/lib/queries/profile";
import { Database, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const profile = await getProfile();
  const isTurso = process.env.TURSO_DATABASE_URL?.startsWith("libsql:");

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="pb-2 border-b">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <span>दुकान सेटिंग्स (Settings & Profile)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          दुकान की प्रोफ़ाइल, UPI पता और सुरक्षा पिन प्रबंधित करें
        </p>
      </div>

      {/* ─── Database & Infrastructure Status ─────────────────────────── */}
      <Card className="border-border/60 bg-muted/20">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <div>
              <span className="font-semibold text-foreground">डेटाबेस मोड: </span>
              <span className="text-muted-foreground">
                {isTurso ? "Turso Managed Cloud libSQL (Active)" : "Local SQLite Engine (local.db)"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-muted-foreground">
              Session Security: <Badge variant="outline" className="text-[10px]">iron-session encrypted</Badge>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ─── Settings Form ────────────────────────────────────────────── */}
      <SettingsForm profile={profile} />
    </div>
  );
}
