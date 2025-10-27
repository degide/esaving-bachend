import { PrismaClient } from "../../src/modules/prisma/client/client";
const prisma = new PrismaClient();
async function main() {
  // Add data seeding here
  await Promise.resolve();
  console.log("Seeding database...");
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
