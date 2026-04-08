import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
const adapter = connectionString ? new PrismaPg({ connectionString }) : undefined;

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  } as never);

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
