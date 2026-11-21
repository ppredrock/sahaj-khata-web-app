import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";

// Cross-compatible SQLite UUID generation
const uuid = () =>
  sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))))`;

// ─── profiles / business ──────────────────────────────────────────────────────
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey().default(uuid()),
  storeName: text("store_name").notNull().default("Mera Vyapar"),
  ownerName: text("owner_name").notNull().default("Dukandar"),
  phone: text("phone"),
  pinHash: text("pin_hash"), // bcrypt hash of 4-6 digit PIN
  currency: text("currency").notNull().default("₹"),
  upiId: text("upi_id"),
  address: text("address"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ─── contacts ────────────────────────────────────────────────────────────────
// Customers, Suppliers, or Both
export const contacts = sqliteTable(
  "contacts",
  {
    id: text("id").primaryKey().default(uuid()),
    name: text("name").notNull(),
    phone: text("phone"),
    type: text("type", { enum: ["customer", "supplier", "both"] })
      .notNull()
      .default("customer"),
    notes: text("notes"),
    isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("idx_contacts_phone").on(t.phone)]
);

// ─── gallaTransactions ───────────────────────────────────────────────────────
// Cash book entries – daily inflow and outflow
export const gallaTransactions = sqliteTable(
  "galla_transactions",
  {
    id: text("id").primaryKey().default(uuid()),
    date: text("date").notNull(), // YYYY-MM-DD
    type: text("type", { enum: ["inflow", "outflow"] }).notNull(),
    amount: real("amount").notNull(),
    category: text("category", {
      enum: ["sale", "purchase", "expense", "other"],
    }).default("sale"),
    description: text("description"),
    contactId: text("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    paymentMode: text("payment_mode").default("cash"), // cash, upi, bank
    linkedUdharId: text("linked_udhar_id"),
    voiceRaw: text("voice_raw"),
    isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    index("idx_galla_date").on(t.date),
    index("idx_galla_contact").on(t.contactId),
  ]
);

// ─── udharTransactions ───────────────────────────────────────────────────────
// Credit book entries – money given on credit or received against credit
export const udharTransactions = sqliteTable(
  "udhar_transactions",
  {
    id: text("id").primaryKey().default(uuid()),
    date: text("date").notNull(), // YYYY-MM-DD
    type: text("type", { enum: ["given", "received"] }).notNull(),
    amount: real("amount").notNull(),
    contactId: text("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    description: text("description"),
    dueDate: text("due_date"), // YYYY-MM-DD
    linkedGallaId: text("linked_galla_id"),
    settled: integer("settled", { mode: "boolean" }).default(false),
    settledDate: text("settled_date"),
    voiceRaw: text("voice_raw"),
    isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    index("idx_udhar_contact").on(t.contactId),
    index("idx_udhar_date").on(t.date),
    index("idx_udhar_due").on(t.dueDate),
  ]
);

// ─── dailyClosings ───────────────────────────────────────────────────────────
// End-of-day cash reconciliation – one record per date
export const dailyClosings = sqliteTable("daily_closings", {
  id: text("id").primaryKey().default(uuid()),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  openingBalance: real("opening_balance").notNull().default(0),
  totalInflow: real("total_inflow").notNull().default(0),
  totalOutflow: real("total_outflow").notNull().default(0),
  expectedBalance: real("expected_balance").notNull().default(0),
  actualBalance: real("actual_balance"),
  mismatch: real("mismatch"),
  mismatchNote: text("mismatch_note"),
  closedAt: integer("closed_at", { mode: "timestamp_ms" }),
  status: text("status", { enum: ["open", "closed"] }).default("open"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ─── reminders ───────────────────────────────────────────────────────────────
export const reminders = sqliteTable(
  "reminders",
  {
    id: text("id").primaryKey().default(uuid()),
    contactId: text("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    udharId: text("udhar_id").references(() => udharTransactions.id, {
      onDelete: "set null",
    }),
    type: text("type", {
      enum: ["payment_due", "follow_up", "custom"],
    }).notNull(),
    scheduledDate: text("scheduled_date").notNull(), // YYYY-MM-DD
    scheduledTime: text("scheduled_time"), // HH:mm
    message: text("message"),
    status: text("status", {
      enum: ["pending", "sent", "dismissed"],
    }).default("pending"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("idx_reminders_date").on(t.scheduledDate)]
);

// ─── appSettings ─────────────────────────────────────────────────────────────
export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
