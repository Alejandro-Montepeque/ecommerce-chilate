import { PrismaClient } from "@prisma/client";
import { seedAdmin } from "./seeders/admin";
import { seedCatalogs } from "./seeders/catalogs";
import { seedLanding } from "./seeders/landing";
import { seedEmails } from "./seeders/emails";

const prisma = new PrismaClient();

// Runner de seeders. Cada seeder es independiente y se ejecuta UNA sola vez:
// antes de correrlo se consulta SeederLog; si ya está registrado, se omite.
// Así el seed puede correr en cada deploy sin duplicar ni re-ejecutar nada.
const seeders: { name: string; run: (p: PrismaClient) => Promise<void> }[] = [
  { name: "001-admin", run: seedAdmin },
  { name: "002-catalogs", run: seedCatalogs },
  { name: "003-landing-content", run: seedLanding },
  { name: "004-email-content", run: seedEmails },
];

async function main() {
  for (const s of seeders) {
    const already = await prisma.seederLog.findUnique({
      where: { name: s.name },
    });
    if (already) {
      console.log(`↷ seeder "${s.name}" ya ejecutado, se omite`);
      continue;
    }
    await s.run(prisma);
    await prisma.seederLog.create({ data: { name: s.name } });
    console.log(`✓ seeder "${s.name}" ejecutado`);
  }
  console.log("Seeders completados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
