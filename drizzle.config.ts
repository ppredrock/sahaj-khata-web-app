import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const isTurso = process.env.TURSO_DATABASE_URL?.startsWith("libsql:") || !!process.env.TURSO_AUTH_TOKEN;

export default defineConfig(
  isTurso
    ? {
        schema: "./lib/db/schema.ts",
        out: "./drizzle",
        dialect: "turso",
        dbCredentials: {
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN!,
        },
      }
    : {
        schema: "./lib/db/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: {
          url: "local.db",
        },
      }
);
