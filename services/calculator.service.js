/**
 * Kalkulasi kebutuhan bibit kentang (G0, G2, G3)
 * Mendukung harga per kg / kuintal (G3), fallback ke DB bila ada.
 */

const DEFAULT_SEEDS_PER_KG = {
  G2: { min: 15, max: 15 },
  G3: { min: 12, max: 18 },
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

  const dMin = toNum(fromDb?.seeds_per_kg_min);
  const dMax = toNum(fromDb?.seeds_per_kg_max);
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

const calculateSeedNeeds = (params, dbParam = null) => {
  const L = Number(params.panjangLahan);
  const W_field = Number(params.lebarLahan);
  const W_ridge = params.lebarGuludan ? Number(params.lebarGuludan) / 100 : 0.8;
  const W_furrow = Number(params.lebarParit) / 100;
  const s = Number(params.jarakTanam) / 100;
  const gen = String(params.generasiBibit).toUpperCase();

  if (
    ![L, W_field, W_ridge, W_furrow, s].every(
      (v) => Number.isFinite(v) && v > 0
    )
  ) {
    return {
      error: "Input tidak valid. Pastikan semua angka diisi dengan benar.",
    };
  }

  const U = W_ridge + W_furrow;
  let J = Math.floor(W_field / U);
  const sisa = W_field - J * U;
  const ridgeMin = 0.75;
  const J_final = J + (sisa >= ridgeMin ? 1 : 0);

  const T_row = Math.floor(L / s) + 1;
  const T_pop = J_final * T_row * 1;

  let kebutuhanLabel,
    note,
    detailKg = null;
  let unitBibit = gen === "G0" ? "biji" : "kg";
  let biayaLabel = "Tidak dihitung";

  if (gen === "G0") {
    kebutuhanLabel = `${T_pop.toLocaleString("id-ID")} biji`;
    note = "Unit biji (G0). Harga per kg tidak berlaku.";

    const price = mergePrice(
      gen,
      params.estimasiHarga,
      "biji",
      dbParam?.price_per_unit_min,
      dbParam?.price_per_unit_max,
      "biji"
    );
    if (price.mode === "single") {
      biayaLabel = `Rp ${(price.priceKg * T_pop).toLocaleString("id-ID")}`;
    } else if (price.mode === "range") {
      biayaLabel = `Rp ${(price.minKg * T_pop).toLocaleString("id-ID")} - Rp ${(
        price.maxKg * T_pop
      ).toLocaleString("id-ID")}`;
    }
  } else {
    const seeds = mergeSeedsPerKg(gen, params.jumlahBibitPerKg, dbParam);
    const kg_min = Math.ceil(T_pop / seeds.max); // umbi kecil → kg rendah
    const kg_max = Math.ceil(T_pop / seeds.min); // umbi besar → kg tinggi
    const kg_est = Math.ceil((kg_min + kg_max) / 2);

    kebutuhanLabel = `${kg_est.toLocaleString("id-ID")} kg (${(
      kg_est / 100
    ).toFixed(2)} kuintal)`;
    note =
      "Angka perkiraan. Kebutuhan bisa lebih sedikit/lebih banyak tergantung ukuran umbi (biji/kg).";
    detailKg = { kg_min, kg_est, kg_max };

    const price = mergePrice(
      gen,
      params.estimasiHarga,
      params.estimasiHargaUnit,
      dbParam?.price_per_unit_min,
      dbParam?.price_per_unit_max,
      dbParam?.unit
    );
    if (price.mode === "single") {
      biayaLabel = `Rp ${(price.priceKg * kg_est).toLocaleString("id-ID")}`;
    } else if (price.mode === "range") {
      biayaLabel = `Rp ${(price.minKg * kg_est).toLocaleString(
        "id-ID"
      )} - Rp ${(price.maxKg * kg_est).toLocaleString("id-ID")}`;
    }
  }

  return {
    ringkasanLahan: {
      lebarUnitTanam: `${U.toFixed(2)} meter`,
      jumlahGuludan: `${J_final} baris`,
      panjangTanamPerGuludan: `${L.toFixed(2)} meter`,
    },
    kebutuhanTanam: {
      jumlahTanamanPerGuludan: `${T_row} pohon`,
      totalPopulasiTanaman: `${T_pop.toLocaleString("id-ID")} pohon`,
    },
    kebutuhanBibit: {
      estimasi: kebutuhanLabel,
      unit: unitBibit,
      rangeKg: detailKg,
      note,
    },
    estimasiBiaya: {
      total: biayaLabel,
    },
  };
};

module.exports = { calculateSeedNeeds };
