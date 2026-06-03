'use strict';

const {
  validateSeedNeeds,
  validateReverseSeeds,
} = require('../../middlewares/calculator.validator');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: buat mock req/res/next
// ─────────────────────────────────────────────────────────────────────────────
const makeReq = (body) => ({ body });

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ─────────────────────────────────────────────────────────────────────────────
// validateSeedNeeds
// ─────────────────────────────────────────────────────────────────────────────
describe('validateSeedNeeds', () => {
  // V-1: input valid G2
  test('V-1: input valid G2 → next() dipanggil dan req.dto terisi', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G2',
      panjangLahan: 10,
      lebarLahan: 5,
      lebarGuludan: 80,
      lebarParit: 20,
      jarakTanam: 25,
    });
    const res = makeRes();

    validateSeedNeeds(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.dto).toBeDefined();
    expect(req.dto.generasiBibit).toBe('G2');
  });

  // V-2: generasiBibit tidak valid (G4)
  test('V-2: generasiBibit "G4" → 422 dengan errors', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G4',
      panjangLahan: 10,
      lebarLahan: 5,
      lebarParit: 20,
      jarakTanam: 25,
    });
    const res = makeRes();

    validateSeedNeeds(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty('errors');
  });

  // V-3: panjangLahan tidak ada
  test('V-3: panjangLahan tidak ada → 422', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G2',
      lebarLahan: 5,
      lebarParit: 20,
      jarakTanam: 25,
    });
    const res = makeRes();

    validateSeedNeeds(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
  });

  // V-4: panjangLahan negatif
  test('V-4: panjangLahan = -5 → 422', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G2',
      panjangLahan: -5,
      lebarLahan: 5,
      lebarParit: 20,
      jarakTanam: 25,
    });
    const res = makeRes();

    validateSeedNeeds(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
  });

  // V-5: lebarGuludan tidak ada → default 80
  test('V-5: lebarGuludan tidak ada → req.dto.lebarGuludan === 80 (default)', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G2',
      panjangLahan: 10,
      lebarLahan: 5,
      lebarParit: 20,
      jarakTanam: 25,
    });
    const res = makeRes();

    validateSeedNeeds(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.dto.lebarGuludan).toBe(80);
  });

  // V-6: input valid G0
  test('V-6: input valid G0 → next() dipanggil', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G0',
      panjangLahan: 10,
      lebarLahan: 5,
      lebarParit: 20,
      jarakTanam: 25,
    });
    const res = makeRes();

    validateSeedNeeds(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.dto.generasiBibit).toBe('G0');
  });

  // V-7: generasiBibit lowercase 'g2' → dikonversi ke uppercase G2
  test('V-7: generasiBibit "g2" (lowercase) → dikonversi jadi "G2"', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'g2',
      panjangLahan: 10,
      lebarLahan: 5,
      lebarParit: 20,
      jarakTanam: 25,
    });
    const res = makeRes();

    validateSeedNeeds(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.dto.generasiBibit).toBe('G2');
  });

  // V-8: lebarParit tidak ada → 422
  test('V-8: lebarParit tidak ada → 422', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G2',
      panjangLahan: 10,
      lebarLahan: 5,
      jarakTanam: 25,
    });
    const res = makeRes();

    validateSeedNeeds(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateReverseSeeds
// ─────────────────────────────────────────────────────────────────────────────
describe('validateReverseSeeds', () => {
  // VR-1: input valid G2
  test('VR-1: input valid G2 → next() dipanggil', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G2',
      jumlahBibit: 100,
      jarakTanam: 25,
      lebarGuludan: 80,
      lebarParit: 20,
    });
    const res = makeRes();

    validateReverseSeeds(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.dto.generasiBibit).toBe('G2');
  });

  // VR-2: jumlahBibit = 0 → 422
  test('VR-2: jumlahBibit = 0 → 422 (harus > 0)', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G2',
      jumlahBibit: 0,
      jarakTanam: 25,
      lebarParit: 20,
    });
    const res = makeRes();

    validateReverseSeeds(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
  });

  // VR-3: generasiBibit hilang → 422
  test('VR-3: generasiBibit tidak ada → 422', () => {
    const next = jest.fn();
    const req = makeReq({
      jumlahBibit: 100,
      jarakTanam: 25,
      lebarParit: 20,
    });
    const res = makeRes();

    validateReverseSeeds(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
  });

  // VR-4: lebarGuludan tidak ada → default 80
  test('VR-4: lebarGuludan tidak ada → req.dto.lebarGuludan === 80 (default)', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G2',
      jumlahBibit: 100,
      jarakTanam: 25,
      lebarParit: 20,
    });
    const res = makeRes();

    validateReverseSeeds(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.dto.lebarGuludan).toBe(80);
  });

  // VR-5: input valid G0
  test('VR-5: input valid G0 → next() dipanggil', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G0',
      jumlahBibit: 500,
      jarakTanam: 25,
      lebarParit: 20,
    });
    const res = makeRes();

    validateReverseSeeds(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  // VR-6: jumlahBibit negatif → 422
  test('VR-6: jumlahBibit negatif → 422', () => {
    const next = jest.fn();
    const req = makeReq({
      generasiBibit: 'G3',
      jumlahBibit: -10,
      jarakTanam: 25,
      lebarParit: 20,
    });
    const res = makeRes();

    validateReverseSeeds(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
  });
});
