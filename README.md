# Sahaj Khata Web App (सहज खाता)

A modern, fast, responsive web application for Indian small business owners, shopkeepers, and merchants (*Dukandars*). Built using the modern web stack from **Little Miss PS** (`kaira-digital-app`):

- **Next.js 16 (App Router)** & **React 19**
- **Tailwind CSS v4** & **shadcn/ui** (Radix UI primitives)
- **Turso (libSQL)** & **Drizzle ORM** (hybrid local SQLite `file:local.db` & cloud Turso)
- **iron-session** (Stateless, encrypted cookies) & **bcryptjs** (PIN security)
- **Sonner** (Rich toasts), **Lucide React** (Icons), and **next-themes** (Dark/Light mode)

---

## 🚀 Features

1. **Dashboard (`/`)**:
   - Real-time today's cashflow summary (Inflow vs Outflow).
   - Outstanding credit to collect (*Aapko Lena Hai*) and debts to pay (*Aapko Dena Hai*).
   - Quick Action modals: `+ नकद आमद`, `+ नकद खर्चा`, `+ उधार दिया`, `+ उधार मिला`.
   - Daily cash closing status indicator.

2. **Galla / Cash Book (`/galla`)**:
   - Full cashbook ledger with date navigation.
   - Filter by Inflow (sales, other) and Outflow (expenses, stock purchases).
   - **Dainik Rokad Bandh (Daily Closing)** modal: Reconciles opening balance + daily flow against physical drawer cash count, with surplus/shortage discrepancy detection and notes.

3. **Udhar / Credit Ledger (`/udhar`)**:
   - Customer & Supplier tabs.
   - Live search by contact name or phone number.
   - Outstanding balance badges.
   - **One-Click WhatsApp Payment Reminder**: Pre-formatted polite Hindi/English reminder template with shop name, balance due, and UPI ID link.
   - Instant debt settlement with automatic sync to the Galla cashbook.

4. **Parties & Contacts (`/contacts` & `/contacts/[id]`)**:
   - Contact directory (customer, supplier, or both).
   - Detailed **Passbook Statement**: chronological ledger of transactions with printable format for 80mm POS or A4 statements.

5. **Reports & Backup (`/reports`)**:
   - Summary of inflows, outflows, receivables, and payables.
   - Category-wise expense and sales breakdown.
   - One-click JSON database backup and export (`/api/export`).

6. **Settings & PIN Lock (`/settings`)**:
   - Shop name, owner name, contact number, UPI ID, and address.
   - Optional Dukandar security PIN.
   - Live database engine indicator.

---

## 🛠️ Quick Start

### 1. Run Locally (Zero-Config SQLite)
By default, the app uses a local SQLite database file (`local.db`) with `@libsql/client`:

```bash
cd /Users/prakharkulshrestha/Desktop/ppredrock/sahajkhata-web
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### 2. Connect to Cloud Turso (Production / Vercel)
Set your Turso database credentials in `.env.local`:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token
SESSION_SECRET=your_32_character_session_encryption_secret
```

Then push the schema:
```bash
npm run db:push
```

### 3. Build & Test Production Bundle
```bash
npm run build
npm start
```
