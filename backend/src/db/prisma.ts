import { PrismaClient } from "@prisma/client";

// Single shared Prisma client (connection pooling + reused across modules).
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});