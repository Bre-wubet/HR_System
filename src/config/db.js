import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

// Single Prisma client instance for the app lifecycle
export const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export async function verifyDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection verified");
  } catch (error) {
    logger.error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}


