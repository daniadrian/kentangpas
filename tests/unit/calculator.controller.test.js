'use strict';

// Mock service SEBELUM require controller/helpers.
// Handler di helpers.js memanggil CalculatorService — dengan service ter-mock,
// semua handler otomatis menggunakan mock tanpa perlu mengganti SEED_NEEDS_HANDLERS.
jest.mock('../../services/calculator.service');

const service = require('../../services/calculator.service');
const {
  getRoot,
  getSeedParameters,
  calculateSeeds,
  calculateReverseSeedsController,
} = require('../../controllers/calculator.controller');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: mock req/res
// ─────────────────────────────────────────────────────────────────────────────
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ─────────────────────────────────────────────────────────────────────────────
// getRoot
// ─────────────────────────────────────────────────────────────────────────────
describe('getRoot', () => {
  test('C-1: mengembalikan 200 dengan success:true', () => {
    const req = {};
    const res = makeRes();

    getRoot(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('message');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getSeedParameters
// ─────────────────────────────────────────────────────────────────────────────
describe('getSeedParameters', () => {
  afterEach(() => jest.clearAllMocks());

  test('C-2: service resolve → 200 dengan data', async () => {
    const fakeData = [{ id: 1, generationName: 'G2' }];
    service.getAllSeedParameters.mockResolvedValue(fakeData);

    const req = {};
    const res = makeRes();
    await getSeedParameters(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual(fakeData);
  });

  test('C-3: service throw error → 500', async () => {
    service.getAllSeedParameters.mockRejectedValue(new Error('DB down'));

    const req = {};
    const res = makeRes();
    await getSeedParameters(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateSeeds
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateSeeds', () => {
  afterEach(() => jest.clearAllMocks());

  const baseDto = {
    generasiBibit: 'G2',
    panjangLahan: 10,
    lebarLahan: 5,
    lebarGuludan: 80,
    lebarParit: 20,
    jarakTanam: 25,
  };

  test('C-4: gen G2 valid → service.calculateSeedNeedsG2 dipanggil, 200 success:true', async () => {
    const fakeResult = { kebutuhanBibit: { unit: 'kg' } };
    service.calculateSeedNeedsG2.mockResolvedValue(fakeResult);

    const req = { dto: baseDto };
    const res = makeRes();
    await calculateSeeds(req, res);

    expect(service.calculateSeedNeedsG2).toHaveBeenCalledWith(baseDto);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual(fakeResult);
  });

  test('C-5: gen INVALID → 400', async () => {
    const req = { dto: { generasiBibit: 'INVALID' } };
    const res = makeRes();
    await calculateSeeds(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  test('C-6: handler throw → 500', async () => {
    service.calculateSeedNeedsG2.mockRejectedValue(new Error('kalkulasi gagal'));

    const req = { dto: baseDto };
    const res = makeRes();
    await calculateSeeds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  test('C-10: gen G0 valid → service.calculateSeedNeedsG0 dipanggil', async () => {
    const fakeResult = { kebutuhanBibit: { unit: 'biji' } };
    service.calculateSeedNeedsG0.mockResolvedValue(fakeResult);

    const req = { dto: { ...baseDto, generasiBibit: 'G0' } };
    const res = makeRes();
    await calculateSeeds(req, res);

    expect(service.calculateSeedNeedsG0).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateReverseSeedsController
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateReverseSeedsController', () => {
  afterEach(() => jest.clearAllMocks());

  const baseDto = {
    generasiBibit: 'G2',
    jumlahBibit: 100,
    jarakTanam: 25,
    lebarGuludan: 80,
    lebarParit: 20,
  };

  test('C-7: gen G2 valid → service.calculateReverseSeedsG2 dipanggil, 200 success:true', async () => {
    const fakeResult = { ringkasan: { estimasiLuasM2: '100.0' } };
    service.calculateReverseSeedsG2.mockResolvedValue(fakeResult);

    const req = { dto: baseDto };
    const res = makeRes();
    await calculateReverseSeedsController(req, res);

    expect(service.calculateReverseSeedsG2).toHaveBeenCalledWith(baseDto);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual(fakeResult);
  });

  test('C-8: gen INVALID → 400', async () => {
    const req = { dto: { generasiBibit: 'INVALID' } };
    const res = makeRes();
    await calculateReverseSeedsController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  test('C-9: handler throw → 500', async () => {
    service.calculateReverseSeedsG2.mockRejectedValue(new Error('reverse error'));

    const req = { dto: baseDto };
    const res = makeRes();
    await calculateReverseSeedsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  test('C-11: gen G0 valid → service.calculateReverseSeedsG0 dipanggil', async () => {
    const fakeResult = { ringkasan: { estimasiLuasM2: '50.0' } };
    service.calculateReverseSeedsG0.mockResolvedValue(fakeResult);

    const req = { dto: { ...baseDto, generasiBibit: 'G0' } };
    const res = makeRes();
    await calculateReverseSeedsController(req, res);

    expect(service.calculateReverseSeedsG0).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
