import { PrismaClient } from "@prisma/client";

// Singleton PrismaClient (hindari koneksi berlebih saat HMR di dev).
const g = globalThis as unknown as { __prisma?: PrismaClient };
export const prisma =
  g.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") g.__prisma = prisma;
