import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  contacts,
  gallaTransactions,
  udharTransactions,
  dailyClosings,
  profiles,
} from "@/lib/db/schema";

export async function GET() {
  const allProfiles = await db.select().from(profiles);
  const allContacts = await db.select().from(contacts);
  const allGalla = await db.select().from(gallaTransactions);
  const allUdhar = await db.select().from(udharTransactions);
  const allClosings = await db.select().from(dailyClosings);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    profile: allProfiles[0] || null,
    contacts: allContacts,
    gallaTransactions: allGalla,
    udharTransactions: allUdhar,
    dailyClosings: allClosings,
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sahajkhata_backup_${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
