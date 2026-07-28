import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  arcatesPrisma?: PrismaClient;
};

export const db = globalForPrisma.arcatesPrisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.arcatesPrisma = db;
}

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}
