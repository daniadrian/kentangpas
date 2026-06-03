'use strict';

const { mergeSeedsPerKg, mergePrice } = require('../../lib/calculator.helpers');

// ─────────────────────────────────────────────────────────────────────────────
// mergeSeedsPerKg
// ─────────────────────────────────────────────────────────────────────────────
describe('mergeSeedsPerKg', () => {
  // H-1: G0 selalu null
  test('H-1: G0 mengembalikan null', () => {
    expect(mergeSeedsPerKg('G0', 15, { seedsPerKgMin: 12, seedsPerKgMax: 18 })).toBeNull();
    expect(mergeSeedsPerKg('G0', null, null)).toBeNull();
  });

  // H-2: user input single number → min = max = nilai user
  test('H-2: G2 dengan user value single, mengabaikan DB', () => {
    const db = { seedsPerKgMin: 12, seedsPerKgMax: 18 };
    expect(mergeSeedsPerKg('G2', 15, db)).toEqual({ min: 15, max: 15 });
  });

  // H-3: user input object { min, max }
  test('H-3: G2 dengan user value object { min, max }', () => {
    expect(mergeSeedsPerKg('G2', { min: 10, max: 20 }, null)).toEqual({ min: 10, max: 20 });
  });

  // H-4: tidak ada user value, pakai DB
  test('H-4: G2 tanpa user value, memakai nilai DB', () => {
    const db = { seedsPerKgMin: 12, seedsPerKgMax: 18 };
    expect(mergeSeedsPerKg('G2', null, db)).toEqual({ min: 12, max: 18 });
  });

  // H-5: tidak ada user maupun DB → default G2
  test('H-5: G2 tanpa user dan DB, memakai default G2 (15/15)', () => {
    expect(mergeSeedsPerKg('G2', null, null)).toEqual({ min: 15, max: 15 });
  });

  // H-6: default G3
  test('H-6: G3 tanpa user dan DB, memakai default G3 (12/18)', () => {
    expect(mergeSeedsPerKg('G3', null, null)).toEqual({ min: 12, max: 18 });
  });

  // H-7: case-insensitive gen
  test('H-7: gen lowercase "g2" diproses sama seperti "G2"', () => {
    expect(mergeSeedsPerKg('g2', null, null)).toEqual({ min: 15, max: 15 });
  });

  // H-8: user value 0 atau negatif → diabaikan, pakai DB
  test('H-8: user value 0 diabaikan, jatuh ke DB', () => {
    const db = { seedsPerKgMin: 12, seedsPerKgMax: 18 };
    expect(mergeSeedsPerKg('G2', 0, db)).toEqual({ min: 12, max: 18 });
  });

  // H-9: gen tidak dikenal → default {min:12, max:18}
  test('H-9: gen tidak dikenal, memakai default fallback (12/18)', () => {
    expect(mergeSeedsPerKg('G9', null, null)).toEqual({ min: 12, max: 18 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// mergePrice
// ─────────────────────────────────────────────────────────────────────────────
describe('mergePrice', () => {
  // P-1: user price per kg
  test('P-1: user memberikan harga satuan kg → mode single', () => {
    const result = mergePrice('G2', 5000, 'kg', null, null, null);
    expect(result).toEqual({ mode: 'single', priceKg: 5000 });
  });

  // P-2: user price per kuintal → dibagi 100
  test('P-2: user memberikan harga per kuintal → priceKg = harga/100', () => {
    const result = mergePrice('G2', 500000, 'kuintal', null, null, null);
    expect(result).toEqual({ mode: 'single', priceKg: 5000 });
  });

  // P-3: tanpa user price, DB ada range
  test('P-3: tanpa user price, memakai range harga DB', () => {
    const result = mergePrice('G2', null, null, 3000, 5000, 'kg');
    expect(result).toEqual({ mode: 'range', minKg: 3000, maxKg: 5000 });
  });

  // P-4: tidak ada harga sama sekali
  test('P-4: tidak ada harga → mode none', () => {
    const result = mergePrice('G2', null, null, null, null, null);
    expect(result).toEqual({ mode: 'none' });
  });

  // P-5: user price = 0 → diabaikan, jatuh ke DB range
  test('P-5: user price 0 diabaikan, memakai DB range', () => {
    const result = mergePrice('G2', 0, 'kg', 3000, 5000, 'kg');
    expect(result).toEqual({ mode: 'range', minKg: 3000, maxKg: 5000 });
  });

  // P-6: user price per kuintal nilai besar
  test('P-6: harga 300.000/kuintal → priceKg = 3000', () => {
    const result = mergePrice('G3', 300000, 'kuintal', null, null, null);
    expect(result).toEqual({ mode: 'single', priceKg: 3000 });
  });

  // P-7: DB range per kuintal
  test('P-7: DB range dalam satuan kuintal → dikonversi ke per kg', () => {
    const result = mergePrice('G3', null, null, 300000, 500000, 'kuintal');
    expect(result).toEqual({ mode: 'range', minKg: 3000, maxKg: 5000 });
  });
});
