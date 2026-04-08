import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const name = "Admin";

  // Check if admin exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  // Create via Better Auth
  const result = await auth.api.createUser({
    body: {
      email,
      password,
      name,
      role: "admin",
    },
  });

  if (!result) {
    throw new Error("Failed to create admin user");
  }

  // Create profile
  await db.userProfile.create({
    data: {
      userId: result.user.id,
      username: "admin",
      displayName: name,
    },
  });

  console.log(`✓ Admin created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
