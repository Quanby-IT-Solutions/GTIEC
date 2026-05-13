import { prisma } from "@/lib/prisma";
import "dotenv/config";

async function main() {
  const email = "admin@example.com";
  const name = "System Admin";
  const password = "password";

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
