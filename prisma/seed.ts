import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const name = process.env.ADMIN_NAME ?? "System Admin";
  const password = process.env.ADMIN_PASSWORD ?? "change-me";

  await prisma.admin.upsert({
    where: { email },
    update: {
      name,
      password,
    },
    create: {
      email,
      name,
      password,
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
