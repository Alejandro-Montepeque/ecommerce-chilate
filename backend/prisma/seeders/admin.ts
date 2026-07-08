import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// Seeder: usuario administrador inicial.
export async function seedAdmin(prisma: PrismaClient) {
  const email = "admin@chilate.com";
  const password = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email },
    update: { isSuperAdmin: true },
    create: {
      email,
      password,
      fullName: "Admin Chilate",
      role: Role.ADMIN,
      isSuperAdmin: true,
    },
  });
}
