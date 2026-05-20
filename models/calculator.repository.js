const prisma = require("../lib/prisma");
const { SeedParameters } = require("./calculator.entity");

class CalculatorRepository {
  async getAllSeedParameters() {
    const rows = await prisma.seedParameters.findMany({
      orderBy: { id: "asc" },
      select: {
  id: true,
  generationName: true,
  seedsPerKgMin: true,
  seedsPerKgMax: true,
  pricePerUnitMin: true,
  pricePerUnitMax: true,
  priceUnit: true,
},
    });
    return rows.map((r) => new SeedParameters(r));
  }

  async getSeedParamByGeneration(generationName) {
    const row = await prisma.seedParameters.findFirst({
      where: { generationName: { equals: generationName, mode: "insensitive" } },
      select: {
  id: true,
  generationName: true,
  seedsPerKgMin: true,
  seedsPerKgMax: true,
  pricePerUnitMin: true,
  pricePerUnitMax: true,
  priceUnit: true,
},
    });
    return row ? new SeedParameters(row) : null;
  }
}

module.exports = new CalculatorRepository();
