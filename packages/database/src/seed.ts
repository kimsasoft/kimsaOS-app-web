import { prisma } from "./index";

async function main() {
  console.log("🌱 Seeding database...");

  // Create a sample tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corporation",
      slug: "acme-corp",
      domain: "acme.example.com",
    },
  });

  console.log("✅ Seed completed");
  console.log("Created tenant:", tenant);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
