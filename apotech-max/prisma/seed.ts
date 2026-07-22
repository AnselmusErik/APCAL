import { db as prisma } from "../server/db/client";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding database...");

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Administrator with full access",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      description: "Regular user",
    },
  });

  console.log("Roles created:", { adminRole, userRole });

  // Create permissions
  const permissions = [
    { name: "users:read", description: "Read users" },
    { name: "users:write", description: "Write users" },
    { name: "users:delete", description: "Delete users" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sketciv.com" },
    update: {},
    create: {
      email: "admin@sketciv.com",
      name: "Admin",
      password: hashedPassword,
    },
  });

  // Assign ADMIN role to admin user
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
