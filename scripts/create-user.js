/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const name = "Alex Vance";
  const email = "demo@secondspark.dev";
  const rawPassword = "SecondSpark2026!";

  console.log(`\nCreating / updating demo user...`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${rawPassword}`);

  const passwordHash = await bcrypt.hash(rawPassword, 12);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: {
      name,
      passwordHash,
    },
    create: {
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
    },
  });

  console.log(`User created/updated successfully with ID: ${user.id}`);

  // Verify bcrypt check
  const check = await bcrypt.compare(rawPassword, user.passwordHash);
  console.log(`Credential verification check: ${check ? "SUCCESS" : "FAILED"}`);
}

main()
  .catch((e) => {
    console.error("Error creating user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
