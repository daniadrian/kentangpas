const DEFAULT_SEEDS_PER_KG = {
  G2: { min: 15, max: 15 },
  G3: { min: 12, max: 18 },
};

// Lazy require di dalam setiap lambda menghindari circular dependency:
// helpers → service → helpers. Saat lambda dipanggil (bukan saat load),
// service sudah sepenuhnya tersedia di module cache.
const SEED_NEEDS_HANDLERS = {
  G0: (dto) => require("../services/calculator.service.js").calculateSeedNeedsG0(dto),
  G2: (dto) => require("../services/calculator.service.js").calculateSeedNeedsG2(dto),
  G3: (dto) => require("../services/calculator.service.js").calculateSeedNeedsG3(dto),
};

const REVERSE_SEEDS_HANDLERS = {
  G0: (dto) => require("../services/calculator.service.js").calculateReverseSeedsG0(dto),
  G2: (dto) => require("../services/calculator.service.js").calculateReverseSeedsG2(dto),
  G3: (dto) => require("../services/calculator.service.js").calculateReverseSeedsG3(dto),
};

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function mergeSeedsPerKg(gen, fromUser, fromDb) {
  const G = String(gen || "").toUpperCase();
  if (G === "G0") return null;

  let uMin, uMax;
  if (fromUser && typeof fromUser === "object") {
    uMin = toNum(fromUser.min);
    uMax = toNum(fromUser.max);
  } else {
    const single = toNum(fromUser);
    if (single) uMin = uMax = single;
  }

  const dMin = toNum(fromDb?.seedsPerKgMin);
  const dMax = toNum(fromDb?.seedsPerKgMax);
  const hard = DEFAULT_SEEDS_PER_KG[G] || { min: 12, max: 18 };

  const min = uMin ?? dMin ?? hard.min;
  const max = uMax ?? dMax ?? hard.max;

  return { min, max };
}

function mergePrice(gen, userPrice, userUnit, dbMin, dbMax, dbUnit) {
  const norm = (v, unit) => {
    const n = toNum(v);
    if (!n) return undefined;
    if (String(unit).toLowerCase() === "kuintal") return n / 100;
    return n;
  };

  const pUserKg = norm(userPrice, userUnit);
  if (pUserKg) return { mode: "single", priceKg: pUserKg };

  const pMinKg = norm(dbMin, dbUnit);
  const pMaxKg = norm(dbMax, dbUnit);
  if (pMinKg && pMaxKg) return { mode: "range", minKg: pMinKg, maxKg: pMaxKg };

  return { mode: "none" };
}

module.exports = { mergeSeedsPerKg, mergePrice, SEED_NEEDS_HANDLERS,REVERSE_SEEDS_HANDLERS };
