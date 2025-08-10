const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seedData = [
  {
    generationName: "G0",
    seedsPerKgMin: 25,
    seedsPerKgMax: 30,
    pricePerUnitMin: 2500,
    pricePerUnitMax: 3000,
    priceUnit: "biji",
  },
  {
    generationName: "G2",
    seedsPerKgMin: 15,
    seedsPerKgMax: 15,
    pricePerUnitMin: 25000,
    pricePerUnitMax: 30000,
    priceUnit: "kg",
  },
  {
    generationName: "G3",
    seedsPerKgMin: null,
    seedsPerKgMax: null,
    pricePerUnitMin: 15000,
    pricePerUnitMax: 18000,
    priceUnit: "kg",
  },
  {
    generationName: "Konsumsi",
    seedsPerKgMin: null,
    seedsPerKgMax: null,
    pricePerUnitMin: 15000,
    pricePerUnitMax: 18000,
    priceUnit: "kg",
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const data of seedData) {
    const record = await prisma.seedParameters.upsert({
      where: { generationName: data.generationName },
      update: {},
      create: data,
    });
    console.log(
      `Created/updated record with generationName: ${record.generationName}`
    );
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
