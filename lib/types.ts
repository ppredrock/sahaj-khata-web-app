import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  contacts,
  gallaTransactions,
  udharTransactions,
  dailyClosings,
  reminders,
  profiles,
} from "./db/schema";

export type Profile = InferSelectModel<typeof profiles>;
export type Contact = InferSelectModel<typeof contacts>;
export type NewContact = InferInsertModel<typeof contacts>;

export type GallaTransaction = InferSelectModel<typeof gallaTransactions>;
export type NewGallaTransaction = InferInsertModel<typeof gallaTransactions>;

export type UdharTransaction = InferSelectModel<typeof udharTransactions>;
export type NewUdharTransaction = InferInsertModel<typeof udharTransactions>;

export type DailyClosing = InferSelectModel<typeof dailyClosings>;
export type NewDailyClosing = InferInsertModel<typeof dailyClosings>;

export type Reminder = InferSelectModel<typeof reminders>;

export type ContactWithBalance = Contact & {
  totalGiven: number; // Money given to contact (they owe you)
  totalReceived: number; // Money received from contact
  netBalance: number; // positive = they owe you (Lena hai), negative = you owe them (Dena hai)
  lastTransactionDate?: string | null;
};

export type DashboardStats = {
  todayInflow: number;
  todayOutflow: number;
  todayNet: number;
  totalLenaHai: number; // Total customer udhar to collect
  totalDenaHai: number; // Total supplier udhar to pay
  closingStatus: "open" | "closed";
  expectedClosingBalance: number;
};
