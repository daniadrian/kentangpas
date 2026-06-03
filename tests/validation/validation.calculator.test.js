'use strict';

// Mock Prisma sebelum require apapun — strategi sama dengan integration tests.
// Repository asli tetap dieksekusi; hanya Prisma client yang diganti mock.
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
// Fixture DB — data parameter benih sesuai format Prisma sebelum dibungkus entity
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

// Fixture lahan utama untuk kalkulasi maju (forward):
// U=1.0m, J_final=5, T_row=41, T_pop=205
const BASE_LAHAN = {
  panjangLahan: 10,
  lebarLahan: 5,
  lebarGuludan: 80,
  lebarParit: 20,
  jarakTanam: 25,
};

afterEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// Kelas 1: Kalkulator Kebutuhan Bibit — VL-01 s/d VL-05
// Memvalidasi kebenaran hasil perhitungan terhadap kebutuhan fungsional:
// populasi tanam, unit bibit per generasi, dan kalkulasi estimasi biaya.
// ─────────────────────────────────────────────────────────────────────────────
describe('Kelas 1 — Kalkulator Kebutuhan Bibit (VL-01 s/d VL-05)', () => {
  test('VL-01: G2 — total tanaman 205, jumlah guludan 5 baris, rangeKg {14,14,14}', async () => {
    // Kalkulasi manual: U=1.0, J_final=5, T_row=41, T_pop=205
    // seeds G2: min=max=15 → kg_min=ceil(205/15)=14, kg_max=14, kg_est=14
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G2);

    const res = await request(app)
      .post('/api/calculator')
      .send({ ...BASE_LAHAN, generasiBibit: 'G2' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kebutuhanTanam.totalPopulasiTanaman).toBe('205 pohon');
    expect(res.body.data.ringkasanLahan.jumlahGuludan).toBe('5 baris');
    expect(res.body.data.kebutuhanBibit.unit).toBe('kg');
    const { rangeKg } = res.body.data.kebutuhanBibit;
    expect(rangeKg.kg_min).toBe(14);
    expect(rangeKg.kg_est).toBe(14);
    expect(rangeKg.kg_max).toBe(14);
  });

  test('VL-02: G0 — unit "biji", rangeKg null, estimasi mencantumkan 205 biji', async () => {
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G0);

    const res = await request(app)
      .post('/api/calculator')
      .send({ ...BASE_LAHAN, generasiBibit: 'G0' });

    expect(res.status).toBe(200);
    expect(res.body.data.kebutuhanBibit.unit).toBe('biji');
    expect(res.body.data.kebutuhanBibit.rangeKg).toBeNull();
    expect(res.body.data.kebutuhanBibit.estimasi).toContain('205');
  });

  test('VL-03: G3 — kg_min ≤ kg_est ≤ kg_max dan nilai spesifik sesuai kalkulasi', async () => {
    // seeds G3: min=12, max=18 → kg_min=ceil(205/18)=12, kg_max=ceil(205/12)=18, kg_est=15
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G3);

    const res = await request(app)
      .post('/api/calculator')
      .send({ ...BASE_LAHAN, generasiBibit: 'G3' });

    expect(res.status).toBe(200);
    const { rangeKg } = res.body.data.kebutuhanBibit;
    expect(rangeKg.kg_min).toBeLessThanOrEqual(rangeKg.kg_est);
    expect(rangeKg.kg_est).toBeLessThanOrEqual(rangeKg.kg_max);
    expect(rangeKg.kg_min).toBe(12);
    expect(rangeKg.kg_est).toBe(15);
    expect(rangeKg.kg_max).toBe(18);
  });

  test('VL-04: default lebarGuludan=80cm — hasil total tanaman identik dengan VL-01', async () => {
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G2);
    const { lebarGuludan: _, ...body } = { ...BASE_LAHAN, generasiBibit: 'G2' };

    const res = await request(app).post('/api/calculator').send(body);

    expect(res.status).toBe(200);
    expect(res.body.data.kebutuhanTanam.totalPopulasiTanaman).toBe('205 pohon');
  });

  test('VL-05: G0 dengan harga DB 1500–2000/biji — estimasiBiaya.total dihitung (ada "Rp")', async () => {
    // DB_ROWS.G0 memiliki pricePerUnitMin=1500, pricePerUnitMax=2000 → mode "range" → biaya dihitung
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G0);

    const res = await request(app)
      .post('/api/calculator')
      .send({ ...BASE_LAHAN, generasiBibit: 'G0' });

    expect(res.status).toBe(200);
    expect(res.body.data.estimasiBiaya.total).not.toBe('Tidak dihitung');
    expect(res.body.data.estimasiBiaya.total).toContain('Rp');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Kelas 2: Kalkulator Reverse — VL-06 s/d VL-08
// Memvalidasi kebenaran tipe data estimasiLuasM2 (string vs object)
// berdasarkan apakah seeds.min === seeds.max (G2) atau tidak (G3),
// serta ketersediaan estimasiBiaya khusus G0.
// ─────────────────────────────────────────────────────────────────────────────
describe('Kelas 2 — Kalkulator Reverse (VL-06 s/d VL-08)', () => {
  const BASE_REVERSE = { jarakTanam: 25, lebarGuludan: 80, lebarParit: 20 };

  test('VL-06: Reverse G2 — estimasiLuasM2 bertipe string karena seeds.min === seeds.max', async () => {
    // G2: seeds.min=seeds.max=15 → totalTanamanMin=totalTanamanMax → isRange=false → string
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G2);

    const res = await request(app)
      .post('/api/calculator/reverse')
      .send({ ...BASE_REVERSE, generasiBibit: 'G2', jumlahBibit: 100 });

    expect(res.status).toBe(200);
    expect(typeof res.body.data.ringkasan.estimasiLuasM2).toBe('string');
    expect(res.body.data.estimasiPopulasi.totalTanaman).toBeDefined();
  });

  test('VL-07: Reverse G0 — output mengandung estimasiBiaya dengan total terdefinisi', async () => {
    // G0 reverse mengembalikan estimasiBiaya; G2/G3 reverse tidak
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G0);

    const res = await request(app)
      .post('/api/calculator/reverse')
      .send({ ...BASE_REVERSE, generasiBibit: 'G0', jumlahBibit: 500 });

    expect(res.status).toBe(200);
    expect(res.body.data.estimasiBiaya).toBeDefined();
    expect(res.body.data.estimasiBiaya.total).toBeDefined();
    expect(res.body.data.estimasiPopulasi.totalTanaman).toBeDefined();
  });

  test('VL-08: Reverse G3 — estimasiLuasM2 bertipe object {min, max} karena seeds.min ≠ seeds.max', async () => {
    // G3: seeds.min=12, seeds.max=18 → totalTanamanMin≠totalTanamanMax → isRange=true → object
    prisma.seedParameters.findFirst.mockResolvedValue(DB_ROWS.G3);

    const res = await request(app)
      .post('/api/calculator/reverse')
      .send({ ...BASE_REVERSE, generasiBibit: 'G3', jumlahBibit: 200 });

    expect(res.status).toBe(200);
    const { estimasiLuasM2 } = res.body.data.ringkasan;
    expect(typeof estimasiLuasM2).toBe('object');
    expect(estimasiLuasM2).not.toBeNull();
    expect(estimasiLuasM2).toHaveProperty('min');
    expect(estimasiLuasM2).toHaveProperty('max');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Kelas 3: Validasi Input — VL-09 s/d VL-12
// Memvalidasi bahwa sistem menolak input tidak valid dengan HTTP 422
// sesuai kebutuhan fungsional: generasi tidak dikenal, nilai negatif,
// field wajib kosong, dan jumlahBibit nol.
// ─────────────────────────────────────────────────────────────────────────────
describe('Kelas 3 — Validasi Input (VL-09 s/d VL-12)', () => {
  test('VL-09: generasiBibit "G4" tidak dikenal — 422 dengan errors array', async () => {
    const res = await request(app)
      .post('/api/calculator')
      .send({ ...BASE_LAHAN, generasiBibit: 'G4' });

    expect(res.status).toBe(422);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
  });

  test('VL-10: panjangLahan bernilai negatif (-5) — 422', async () => {
    const res = await request(app)
      .post('/api/calculator')
      .send({ ...BASE_LAHAN, generasiBibit: 'G2', panjangLahan: -5 });

    expect(res.status).toBe(422);
  });

  test('VL-11: panjangLahan tidak disertakan — 422 dengan errors array tidak kosong', async () => {
    const { panjangLahan: _, ...body } = { ...BASE_LAHAN, generasiBibit: 'G2' };

    const res = await request(app).post('/api/calculator').send(body);

    expect(res.status).toBe(422);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
  });

  test('VL-12: jumlahBibit=0 pada kalkulator reverse — 422 dengan errors array', async () => {
    const res = await request(app)
      .post('/api/calculator/reverse')
      .send({ generasiBibit: 'G2', jumlahBibit: 0, jarakTanam: 25, lebarGuludan: 80, lebarParit: 20 });

    expect(res.status).toBe(422);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Kelas 4: Endpoint Umum — VL-13 s/d VL-15
// Memvalidasi ketersediaan endpoint infrastruktur: health check,
// daftar parameter benih, dan penanganan route tidak terdaftar.
// ─────────────────────────────────────────────────────────────────────────────
describe('Kelas 4 — Endpoint Umum (VL-13 s/d VL-15)', () => {
  test('VL-13: GET /health — 200, status "ok", timestamp terdefinisi', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  test('VL-14: GET /api/parameters — 200, 3 data benih, setiap item memiliki generationName', async () => {
    prisma.seedParameters.findMany.mockResolvedValue(Object.values(DB_ROWS));

    const res = await request(app).get('/api/parameters');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(3);
    res.body.data.forEach((item) => {
      expect(item).toHaveProperty('generationName');
    });
  });

  test('VL-15: GET /api/endpoint-tidak-ada — 404, success:false', async () => {
    const res = await request(app).get('/api/endpoint-tidak-ada');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
