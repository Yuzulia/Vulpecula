import { ulid } from "ulid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
prisma.$connect();

async function main() {
  const hostLocal = await prisma.host.upsert({
    where: {
      fqdn: ".",
    },
    update: {},
    create: {
      id: ulid(),
      fqdn: ".",
    },
  });

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