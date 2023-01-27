import process from "node:process";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
await db.$connect();

// TODO: Gracefully disconnect the database
process.on("exit", async (_) => {
  await db.$disconnect();
});

export default db;
