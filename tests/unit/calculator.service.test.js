'use strict';

// Mock repository SEBELUM require service agar singleton tidak menyentuh Prisma
jest.mock('../../models/calculator.repository');

const repository = require('../../models/calculator.repository');
const service = require('../../services/calculator.service');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: dto untuk calculateSeedNeeds
// ─────────────────────────────────────────────────────────────────────────────
const makeSeedNeedsDto = (overrides = {}) => ({
  panjangLahan: 10,
  lebarLahan: 5,
  lebarGuludan: 80,
  lebarParit: 20,
  jarakTanam: 25,
  jumlahBibitPerKg: null,
  estimasiHarga: null,
  estimasiHargaUnit: null,
  ...overrides,
});

const makeReverseSeedsDto = (overrides = {}) => ({
  generasiBibit: 'G2',
  jumlahBibit: 100,
  jarakTanam: 25,
  lebarGuludan: 80,
  lebarParit: 20,
  jumlahPerKg: null,
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// _computePlantingGrid (synchronous, akses langsung via instance)
// ─────────────────────────────────────────────────────────────────────────────
describe('_computePlantingGrid', () => {
  // S-1: kasus normal, sisa < 0.75
  test('S-1: kalkulasi normal — lahan 10x5, guludan 80cm, parit 20cm, jarak 25cm', () => {
    const dto = makeSeedNeedsDto();
    const result = service._computePlantingGrid(dto);
    // U = 0.8 + 0.2 = 1.0
    // J = floor(5/1.0) = 5, sisa = 0 → J_final = 5
    // T_row = floor(10/0.25)+1 = 41
    // T_pop = 5 × 41 = 205
    expect(result.U).toBeCloseTo(1.0);
    expect(result.J_final).toBe(5);
    expect(result.T_row).toBe(41);
    expect(result.T_pop).toBe(205);
  });

  // S-2: sisa = 0.75 → J_final bertambah 1
  test('S-2: sisa >= 0.75 → J_final bertambah satu baris', () => {
    const dto = makeSeedNeedsDto({ lebarLahan: 5.75 });
    const result = service._computePlantingGrid(dto);
    // sisa = 5.75 - 5*1.0 = 0.75 >= 0.75 → J_final = 6
    expect(result.J_final).toBe(6);
    expect(result.T_pop).toBe(6 * 41);
  });

  // S-3: guludan 60cm, parit 40cm
  test('S-3: lahan 20x4, guludan 60cm, parit 40cm, jarak 30cm', () => {
    const dto = makeSeedNeedsDto({
      panjangLahan: 20,
      lebarLahan: 4,
      lebarGuludan: 60,
      lebarParit: 40,
      jarakTanam: 30,
    });
    const result = service._computePlantingGrid(dto);
    // U = 0.6 + 0.4 = 1.0
    // J = floor(4/1.0) = 4, sisa = 0 → J_final = 4
    // T_row = floor(20/0.30)+1 = 66+1 = 67
    // T_pop = 4 × 67 = 268
    expect(result.U).toBeCloseTo(1.0);
    expect(result.J_final).toBe(4);
    expect(result.T_row).toBe(67);
    expect(result.T_pop).toBe(268);
  });

  // S-4: jarak tanam kecil → banyak pohon per baris
  test('S-4: jarak tanam 20cm, lahan 10m → T_row = 51', () => {
    const dto = makeSeedNeedsDto({ jarakTanam: 20 });
    const result = service._computePlantingGrid(dto);
    // T_row = floor(10/0.20)+1 = 50+1 = 51
    expect(result.T_row).toBe(51);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// _calcReverseDimensions (synchronous)
// ─────────────────────────────────────────────────────────────────────────────
describe('_calcReverseDimensions', () => {
  // R-1: 1000 tanaman
  test('R-1: 1000 tanaman, jarak 25cm, lebarUnit 1.0m', () => {
    const result = service._calcReverseDimensions(1000, 0.25, 1.0);
    // jumlahGuludan = round(sqrt(1000×0.25/(1.5×1.0))) = round(sqrt(166.67)) = round(12.91) = 13
    expect(result.jumlahGuludan).toBe(13);
    // tanamanPerGuludan = ceil(1000/13) = 77
    expect(result.tanamanPerGuludan).toBe(77);
    // panjangPerGuludan = 77 × 0.25 = 19.25
    expect(result.panjangPerGuludan).toBeCloseTo(19.25);
    // tanamanAktual = 13 × 77 = 1001
    expect(result.tanamanAktual).toBe(1001);
  });

  // R-2: totalTanaman sangat kecil → jumlahGuludan minimum 1
  test('R-2: 1 tanaman — jumlahGuludan tidak kurang dari 1', () => {
    const result = service._calcReverseDimensions(1, 0.25, 1.0);
    expect(result.jumlahGuludan).toBeGreaterThanOrEqual(1);
  });

  // R-3: output memiliki semua properti yang diperlukan
  test('R-3: output mengandung semua properti yang dibutuhkan', () => {
    const result = service._calcReverseDimensions(500, 0.25, 1.0);
    expect(result).toHaveProperty('jumlahGuludan');
    expect(result).toHaveProperty('tanamanPerGuludan');
    expect(result).toHaveProperty('panjangPerGuludan');
    expect(result).toHaveProperty('lebarLahan');
    expect(result).toHaveProperty('luasM2');
    expect(result).toHaveProperty('tanamanAktual');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateSeedNeedsG0 (async, repository di-mock)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateSeedNeedsG0', () => {
  beforeEach(() => {
    repository.getSeedParamByGeneration.mockResolvedValue({
      generationName: 'G0',
      seedsPerKgMin: null,
      seedsPerKgMax: null,
      pricePerUnitMin: 1500,
      pricePerUnitMax: 2000,
      priceUnit: 'biji',
    });
  });

  afterEach(() => jest.clearAllMocks());

  test('G0-1: unit kebutuhan bibit adalah "biji"', async () => {
    const result = await service.calculateSeedNeedsG0(makeSeedNeedsDto());
    expect(result.kebutuhanBibit.unit).toBe('biji');
  });

  test('G0-2: rangeKg adalah null (G0 tidak pakai kg)', async () => {
    const result = await service.calculateSeedNeedsG0(makeSeedNeedsDto());
    expect(result.kebutuhanBibit.rangeKg).toBeNull();
  });

  test('G0-3: output mengandung ringkasanLahan, kebutuhanTanam, estimasiBiaya', async () => {
    const result = await service.calculateSeedNeedsG0(makeSeedNeedsDto());
    expect(result).toHaveProperty('ringkasanLahan');
    expect(result).toHaveProperty('kebutuhanTanam');
    expect(result).toHaveProperty('estimasiBiaya');
  });

  test('G0-4: estimasiBiaya dihitung saat ada harga DB', async () => {
    const result = await service.calculateSeedNeedsG0(makeSeedNeedsDto());
    // DB punya pricePerUnitMin dan Max → mode range → bukan "Tidak dihitung"
    expect(result.estimasiBiaya.total).not.toBe('Tidak dihitung');
  });

  test('G0-5: estimasiBiaya "Tidak dihitung" saat tidak ada harga', async () => {
    repository.getSeedParamByGeneration.mockResolvedValue({
      generationName: 'G0',
      seedsPerKgMin: null,
      seedsPerKgMax: null,
      pricePerUnitMin: null,
      pricePerUnitMax: null,
      priceUnit: 'biji',
    });
    const result = await service.calculateSeedNeedsG0(makeSeedNeedsDto());
    expect(result.estimasiBiaya.total).toBe('Tidak dihitung');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateSeedNeedsG2 (async, repository di-mock)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateSeedNeedsG2', () => {
  beforeEach(() => {
    repository.getSeedParamByGeneration.mockResolvedValue({
      generationName: 'G2',
      seedsPerKgMin: 15,
      seedsPerKgMax: 15,
      pricePerUnitMin: null,
      pricePerUnitMax: null,
      priceUnit: 'kg',
    });
  });

  afterEach(() => jest.clearAllMocks());

  test('G2-1: unit kebutuhan bibit adalah "kg"', async () => {
    const result = await service.calculateSeedNeedsG2(makeSeedNeedsDto());
    expect(result.kebutuhanBibit.unit).toBe('kg');
  });

  test('G2-2: rangeKg berisi kg_min, kg_est, kg_max', async () => {
    const result = await service.calculateSeedNeedsG2(makeSeedNeedsDto());
    expect(result.kebutuhanBibit.rangeKg).toHaveProperty('kg_min');
    expect(result.kebutuhanBibit.rangeKg).toHaveProperty('kg_est');
    expect(result.kebutuhanBibit.rangeKg).toHaveProperty('kg_max');
  });

  test('G2-3: estimasiBiaya "Tidak dihitung" saat DB tidak punya harga', async () => {
    const result = await service.calculateSeedNeedsG2(makeSeedNeedsDto());
    expect(result.estimasiBiaya.total).toBe('Tidak dihitung');
  });

  test('G2-4: estimasiBiaya dihitung saat ada user harga', async () => {
    const dto = makeSeedNeedsDto({ estimasiHarga: 5000, estimasiHargaUnit: 'kg' });
    const result = await service.calculateSeedNeedsG2(dto);
    expect(result.estimasiBiaya.total).not.toBe('Tidak dihitung');
    expect(result.estimasiBiaya.total).toMatch(/^Rp/);
  });

  test('G2-5: kg_min <= kg_est <= kg_max', async () => {
    const result = await service.calculateSeedNeedsG2(makeSeedNeedsDto());
    const { kg_min, kg_est, kg_max } = result.kebutuhanBibit.rangeKg;
    expect(kg_min).toBeLessThanOrEqual(kg_est);
    expect(kg_est).toBeLessThanOrEqual(kg_max);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateSeedNeedsG3 (async, repository di-mock)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateSeedNeedsG3', () => {
  beforeEach(() => {
    repository.getSeedParamByGeneration.mockResolvedValue({
      generationName: 'G3',
      seedsPerKgMin: 12,
      seedsPerKgMax: 18,
      pricePerUnitMin: 2000,
      pricePerUnitMax: 3000,
      priceUnit: 'kg',
    });
  });

  afterEach(() => jest.clearAllMocks());

  test('G3-1: unit kebutuhan bibit adalah "kg"', async () => {
    const result = await service.calculateSeedNeedsG3(makeSeedNeedsDto());
    expect(result.kebutuhanBibit.unit).toBe('kg');
  });

  test('G3-2: estimasiBiaya mengandung range karena harga DB min ≠ max', async () => {
    const result = await service.calculateSeedNeedsG3(makeSeedNeedsDto());
    expect(result.estimasiBiaya.total).toMatch(/Rp .+ - Rp /);
  });

  test('G3-3: rangeKg konsisten — min <= est <= max', async () => {
    const result = await service.calculateSeedNeedsG3(makeSeedNeedsDto());
    const { kg_min, kg_est, kg_max } = result.kebutuhanBibit.rangeKg;
    expect(kg_min).toBeLessThanOrEqual(kg_est);
    expect(kg_est).toBeLessThanOrEqual(kg_max);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateReverseSeedsG0 (async, repository di-mock)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateReverseSeedsG0', () => {
  beforeEach(() => {
    repository.getSeedParamByGeneration.mockResolvedValue({
      generationName: 'G0',
      pricePerUnitMin: 1500,
      pricePerUnitMax: 2000,
      priceUnit: 'biji',
    });
  });

  afterEach(() => jest.clearAllMocks());

  const dto = {
    generasiBibit: 'G0',
    jumlahBibit: 500,
    jarakTanam: 25,
    lebarGuludan: 80,
    lebarParit: 20,
  };

  test('RG0-1: output mengandung ringkasan dan estimasiPopulasi', async () => {
    const result = await service.calculateReverseSeedsG0(dto);
    expect(result).toHaveProperty('ringkasan');
    expect(result).toHaveProperty('estimasiPopulasi');
  });

  test('RG0-2: ringkasan mengandung estimasiLuasM2, jumlahGuludan, panjangPerGuludan', async () => {
    const result = await service.calculateReverseSeedsG0(dto);
    expect(result.ringkasan).toHaveProperty('estimasiLuasM2');
    expect(result.ringkasan).toHaveProperty('jumlahGuludan');
    expect(result.ringkasan).toHaveProperty('panjangPerGuludan');
  });

  test('RG0-3: output mengandung estimasiBiaya', async () => {
    const result = await service.calculateReverseSeedsG0(dto);
    expect(result).toHaveProperty('estimasiBiaya');
  });

  test('RG0-4: estimasiPopulasi.note menyebut jumlah biji dan jarak tanam', async () => {
    const result = await service.calculateReverseSeedsG0(dto);
    expect(result.estimasiPopulasi.note).toMatch(/500/);
    expect(result.estimasiPopulasi.note).toMatch(/25 cm/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateReverseSeedsG2 (async, repository di-mock)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateReverseSeedsG2', () => {
  beforeEach(() => {
    repository.getSeedParamByGeneration.mockResolvedValue({
      generationName: 'G2',
      seedsPerKgMin: 15,
      seedsPerKgMax: 15,
      pricePerUnitMin: null,
      pricePerUnitMax: null,
      priceUnit: 'kg',
    });
  });

  afterEach(() => jest.clearAllMocks());

  test('RG2-1: seedsPerKg min = max → isRange false → luasM2 berupa string bukan object', async () => {
    const dto = makeReverseSeedsDto({ generasiBibit: 'G2', jumlahBibit: 100 });
    const result = await service.calculateReverseSeedsG2(dto);
    // isRange = false → estimasiLuasM2 string, bukan {min, max}
    expect(typeof result.ringkasan.estimasiLuasM2).toBe('string');
  });

  test('RG2-2: seedsPerKg min ≠ max → isRange true → luasM2 berupa object { min, max }', async () => {
    repository.getSeedParamByGeneration.mockResolvedValue({
      generationName: 'G2',
      seedsPerKgMin: 12,
      seedsPerKgMax: 18,
      pricePerUnitMin: null,
      pricePerUnitMax: null,
      priceUnit: 'kg',
    });
    const dto = makeReverseSeedsDto({ generasiBibit: 'G2', jumlahBibit: 100 });
    const result = await service.calculateReverseSeedsG2(dto);
    expect(typeof result.ringkasan.estimasiLuasM2).toBe('object');
    expect(result.ringkasan.estimasiLuasM2).toHaveProperty('min');
    expect(result.ringkasan.estimasiLuasM2).toHaveProperty('max');
  });

  test('RG2-3: output mengandung ringkasan dan estimasiPopulasi', async () => {
    const dto = makeReverseSeedsDto({ generasiBibit: 'G2' });
    const result = await service.calculateReverseSeedsG2(dto);
    expect(result).toHaveProperty('ringkasan');
    expect(result).toHaveProperty('estimasiPopulasi');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateReverseSeedsG3 (async, repository di-mock)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateReverseSeedsG3', () => {
  beforeEach(() => {
    repository.getSeedParamByGeneration.mockResolvedValue({
      generationName: 'G3',
      seedsPerKgMin: 12,
      seedsPerKgMax: 18,
      pricePerUnitMin: null,
      pricePerUnitMax: null,
      priceUnit: 'kg',
    });
  });

  afterEach(() => jest.clearAllMocks());

  test('RG3-1: isRange true → estimasiLuasM2 berupa object', async () => {
    const dto = makeReverseSeedsDto({ generasiBibit: 'G3', jumlahBibit: 200 });
    const result = await service.calculateReverseSeedsG3(dto);
    expect(result.ringkasan.estimasiLuasM2).toHaveProperty('min');
    expect(result.ringkasan.estimasiLuasM2).toHaveProperty('max');
  });

  test('RG3-2: note di estimasiPopulasi menyebut jumlah bibit dan generasi', async () => {
    const dto = makeReverseSeedsDto({ generasiBibit: 'G3', jumlahBibit: 200 });
    const result = await service.calculateReverseSeedsG3(dto);
    expect(result.estimasiPopulasi.note).toMatch(/200/);
    expect(result.estimasiPopulasi.note).toMatch(/G3/);
  });
});
