const prisma = require("../lib/prisma");

const getAllSeedParameters = async () =>
  prisma.seedParameters.findMany({
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

const getSeedParamByGeneration = async (generationName) =>
  prisma.seedParameters.findFirst({
    where: { generationName: { equals: generationName, mode: "insensitive" } },
    select: {
      generationName: true,
      seedsPerKgMin: true,
      seedsPerKgMax: true,
      pricePerUnitMin: true,
      pricePerUnitMax: true,
      priceUnit: true,
    },
  });

module.exports = {
  getAllSeedParameters,
  getSeedParamByGeneration,
};
