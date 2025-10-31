import { hashSync } from "bcryptjs";
import { PrismaClient } from "../../src/modules/prisma/client/client";
import { config } from "dotenv";

config({
  path: ".env",
  override: true,
});

const prisma = new PrismaClient();
async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();
  console.log("connected to database. \nSeed system users with defaults");
  console.table([
    { email: "admin@esaving.com", password: "123456" },
    { email: "tom@gmail.com", password: "123456" },
  ]);
  await prisma.$transaction([
    prisma.user.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        firstName: "System",
        lastName: "Admin",
        email: "admin@esaving.com",
        password: hashSync("123456", process.env.BCRYPT_SALT || 10),
        role: "ADMIN",
        gender: "MALE",
        creditScore: 1000,
        status: "ACTIVE",
        middleName: null,
      },
      update: {
        firstName: "System",
        lastName: "Admin",
        email: "admin@esaving.com",
        password: hashSync("123456", process.env.BCRYPT_SALT || 10),
        role: "ADMIN",
        gender: "MALE",
        creditScore: 1000,
        status: "ACTIVE",
        middleName: null,
      },
    }),
    prisma.user.upsert({
      where: { id: 3 },
      create: {
        id: 3,
        firstName: "Tom",
        lastName: "Kanamugire",
        email: "tom@gmail.com",
        password: hashSync("123456", process.env.BCRYPT_SALT || 10),
        role: "CUSTOMER",
        gender: "MALE",
        creditScore: 1000,
        status: "PENDING",
        middleName: "Jr.",
      },
      update: {
        firstName: "Tom",
        lastName: "Kanamugire",
        email: "tom@gmail.com",
        password: hashSync("123456", process.env.BCRYPT_SALT || 10),
        role: "CUSTOMER",
        gender: "MALE",
        creditScore: 1000,
        status: "PENDING",
        middleName: "Jr.",
      },
    }),
  ]);

  console.log("DONE");
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
