class SeedParameters {
  constructor({ id, generationName, seedsPerKgMin, seedsPerKgMax, pricePerUnitMin, pricePerUnitMax, priceUnit }) {
    this.id = id;
    this.generationName = generationName;
    this.seedsPerKgMin = seedsPerKgMin ?? null;
    this.seedsPerKgMax = seedsPerKgMax ?? null;
    this.pricePerUnitMin = pricePerUnitMin ?? null;
    this.pricePerUnitMax = pricePerUnitMax ?? null;
    this.priceUnit = priceUnit;
  }
}

module.exports = { SeedParameters };
