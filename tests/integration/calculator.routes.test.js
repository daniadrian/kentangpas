'use strict';

// Mock Prisma SEBELUM require apapun — Jest hoisting memastikan ini aktif
// sebelum index.js di-require dan sebelum repository di-load.
// Repository asli (calculator.repository.js) tetap dieksekusi; hanya
// Prisma client yang diganti mock, sehingga tidak butuh koneksi DB nyata.
jest.mock('../../lib/prisma', () => ({
  seedParameters: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

const request = require('supertest');
const app = require('../../index');
const prisma = require('../../lib/prisma');

// ─────────────────────────────────────────────────────────────────────────────
// Fixture: data mentah sesuai format yang dikembalikan Prisma (sebelum
// dibungkus entity SeedParameters oleh repository)
// ─────────────────────────────────────────────────────────────────────────────
const DB_ROWS = {
  G0: {
    id: 1,
    generationName: 'G0',
    seedsPerKgMin: null,
    seedsPerKgMax: null,
    pricePerUnitMin: 1500,
    pricePerUnitMax: 2000,
    priceUnit: 'biji',
  },
  G2: {
    id: 2,
    generationName: 'G2',
    seedsPerKgMin: 15,
    seedsPerKgMax: 15,
    pricePerUnitMin: null,
    pricePerUnitMax: null,
    priceUnit: 'kg',
  },
  G3: {
    id: 3,
    generationName: 'G3',
    seedsPerKgMin: 12,
    seedsPerKgMax: 18,
    pricePerUnitMin: null,
    pricePerUnitMax: null,
    priceUnit: 'kg',
  },
};

afterEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// GET /health
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /health', () => {
  test('I-HEALTH: mengembalikan 200 dengan status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/', () => {
  test('I-1: mengembalikan 200 dengan success:true', async () => {
    const res = await request(app).get('/api/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('message');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/parameters
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/parameters', () => {
  test('I-2: DB return 3 row → 200 dengan data array length 3', async () => {
    prisma.seedParameters.findMany.mockResolvedValue(Object.values(DB_ROWS));

    const res = await request(app).get('/api/parameters');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0]).toHaveProperty('generationName');
  });

  test('I-3: DB throw error → 500 dengan success:false', async () => {
    prisma.seedParameters.findMany.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/parameters');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/calculator
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/calculator', () => {
  const baseG2 = {
    generasiBibit: 'G2',
    panjangLahan: 10,
    lebarLahan: 5,
    lebarGuludan: 80,
    lebarParit: 20,
    jarakTanam: 25,
  };

  test('I-4: valid G2 → 200, kebutuhanBibit.unit==="kg", rangeKg tidak null', async () => {
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G2);

    const res = await request(app).post('/api/calculator').send(baseG2);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kebutuhanBibit.unit).toBe('kg');
    expect(res.body.data.kebutuhanBibit.rangeKg).not.toBeNull();
    expect(res.body.data.ringkasanLahan).toBeDefined();
    expect(res.body.data.kebutuhanTanam).toBeDefined();
  });

  test('I-5: valid G0 → 200, kebutuhanBibit.unit==="biji", rangeKg===null', async () => {
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G0);

    const res = await request(app)
      .post('/api/calculator')
      .send({ ...baseG2, generasiBibit: 'G0' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kebutuhanBibit.unit).toBe('biji');
    expect(res.body.data.kebutuhanBibit.rangeKg).toBeNull();
  });

  test('I-6: valid G3 → 200, kebutuhanBibit.unit==="kg"', async () => {
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G3);

    const res = await request(app)
      .post('/api/calculator')
      .send({ ...baseG2, generasiBibit: 'G3' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kebutuhanBibit.unit).toBe('kg');
  });

  test('I-7: panjangLahan tidak ada → 422, errors array ada', async () => {
    const { panjangLahan: _, ...body } = baseG2;

    const res = await request(app).post('/api/calculator').send(body);

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('I-8: generasiBibit "G4" tidak valid → 422', async () => {
    const res = await request(app)
      .post('/api/calculator')
      .send({ ...baseG2, generasiBibit: 'G4' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  test('I-9: panjangLahan = -5 → 422', async () => {
    const res = await request(app)
      .post('/api/calculator')
      .send({ ...baseG2, panjangLahan: -5 });

    expect(res.status).toBe(422);
  });

  test('I-10: tanpa lebarGuludan → Joi default 80, 200 success', async () => {
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G2);
    const { lebarGuludan: _, ...body } = baseG2;

    const res = await request(app).post('/api/calculator').send(body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('I-11: DB throw error → 500 dengan success:false', async () => {
    prisma.seedParameters.findFirst.mockRejectedValue(new Error('DB timeout'));

    const res = await request(app).post('/api/calculator').send(baseG2);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/calculator/reverse
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/calculator/reverse', () => {
  const baseG2 = {
    generasiBibit: 'G2',
    jumlahBibit: 100,
    jarakTanam: 25,
    lebarGuludan: 80,
    lebarParit: 20,
  };

  test('I-12: valid G2 → 200, ringkasan.estimasiLuasM2 ada', async () => {
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G2);

    const res = await request(app).post('/api/calculator/reverse').send(baseG2);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ringkasan).toHaveProperty('estimasiLuasM2');
    expect(res.body.data.estimasiPopulasi).toHaveProperty('totalTanaman');
  });

  test('I-13: valid G0 → 200, estimasiPopulasi.totalTanaman ada', async () => {
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G0);

    const res = await request(app)
      .post('/api/calculator/reverse')
      .send({ ...baseG2, generasiBibit: 'G0', jumlahBibit: 500 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estimasiPopulasi).toHaveProperty('totalTanaman');
    expect(res.body.data.ringkasan).toHaveProperty('estimasiLuasM2');
  });

  test('I-14: jumlahBibit = 0 → 422', async () => {
    const res = await request(app)
      .post('/api/calculator/reverse')
      .send({ ...baseG2, jumlahBibit: 0 });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  test('I-15: DB throw error → 500 dengan success:false', async () => {
    prisma.seedParameters.findFirst.mockRejectedValue(new Error('DB unavailable'));

    const res = await request(app).post('/api/calculator/reverse').send(baseG2);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
