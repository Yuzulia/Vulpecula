import { PrismaClient } from "@prisma/client";
import { IdGeneratorManager } from "../src/libs/utils";

const prisma = new PrismaClient();
await prisma.$connect();

async function main(): Promise<void> {
  const hostLocal = await prisma.host.upsert({
    where: {
      fqdn: ".",
    },
    update: {},
    create: {
      id: IdGeneratorManager.generate().id,
      fqdn: ".",
    },
  });

  // TODO: Role Template seed set (e.g. Super user, Moderator, Silence etc.)

  console.log({ hostLocal });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
