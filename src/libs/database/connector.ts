import { PrismaClient } from "@prisma/client";

export const databaseClient = new PrismaClient();
await databaseClient.$connect();

process.on("exit", (_) => {
  void databaseClient.$disconnect();
});
