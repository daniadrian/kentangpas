const repository = require("../models/calculator.repository");
const { mergeSeedsPerKg, mergePrice } = require("../lib/calculator.helpers");

class CalculatorService {
  getAllSeedParameters() {
    return repository.getAllSeedParameters();
  }

  async calculateSeedNeeds(params) {
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

    const dbParam = await repository.getSeedParamByGeneration(gen);

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
        dbParam?.pricePerUnitMin,
        dbParam?.pricePerUnitMax,
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
      const kg_min = Math.ceil(T_pop / seeds.max);
      const kg_max = Math.ceil(T_pop / seeds.min);
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
        dbParam?.pricePerUnitMin,
        dbParam?.pricePerUnitMax,
        dbParam?.priceUnit
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
  }

  async calculateReverseSeeds(params) {
    const jumlahBibit = Number(params.jumlahBibit);
    const jarakTanam = Number(params.jarakTanam) / 100;
    const lebarGuludan = params.lebarGuludan ? Number(params.lebarGuludan) / 100 : 0.8;
    const lebarParit = Number(params.lebarParit) / 100;
    const gen = String(params.generasiBibit).toUpperCase();

    if (
      ![jumlahBibit, jarakTanam, lebarGuludan, lebarParit].every(
        (v) => Number.isFinite(v) && v > 0
      )
    ) {
      return {
        error: "Input tidak valid. Pastikan semua angka diisi dengan benar.",
      };
    }

    const dbParam = await repository.getSeedParamByGeneration(gen);

    let totalTanamanMin, totalTanamanMax;
    let notePrefix;

    if (gen === "G0") {
      totalTanamanMin = totalTanamanMax = jumlahBibit;
      notePrefix = `Dengan ${jumlahBibit.toLocaleString("id-ID")} biji bibit G0`;
    } else if (gen === "G2" || gen === "G3") {
      const seeds = mergeSeedsPerKg(gen, params.jumlahPerKg, dbParam);

      totalTanamanMin = jumlahBibit * seeds.min;
      totalTanamanMax = jumlahBibit * seeds.max;

      const seedsLabel =
        seeds.min === seeds.max
          ? `${seeds.min} biji/kg`
          : `${seeds.min}–${seeds.max} biji/kg`;
      notePrefix = `Dengan ${jumlahBibit.toLocaleString("id-ID")} kg bibit ${gen} (estimasi ${seedsLabel})`;
    } else {
      return {
        error: "Generasi bibit harus G0, G2, atau G3.",
      };
    }

    const lebarUnitTanam = lebarGuludan + lebarParit;
    const targetRasio = 1.5;

    const calcDimensions = (totalTanaman) => {
      let jumlahGuludan = Math.round(
        Math.sqrt((totalTanaman * jarakTanam) / (targetRasio * lebarUnitTanam))
      );
      if (jumlahGuludan < 1) jumlahGuludan = 1;

      const tanamanPerGuludan = Math.ceil(totalTanaman / jumlahGuludan);
      const panjangPerGuludan = tanamanPerGuludan * jarakTanam;
      const lebarLahan = jumlahGuludan * lebarUnitTanam;
      const luasM2 = panjangPerGuludan * lebarLahan;
      const tanamanAktual = jumlahGuludan * tanamanPerGuludan;

      return { jumlahGuludan, tanamanPerGuludan, panjangPerGuludan, lebarLahan, luasM2, tanamanAktual };
    };

    const isRange = totalTanamanMin !== totalTanamanMax;
    const dimMin = calcDimensions(totalTanamanMin);
    const dimMax = isRange ? calcDimensions(totalTanamanMax) : dimMin;

    const fmt1 = (n) => n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const jarakLabel = `${(jarakTanam * 100).toFixed(0)} cm`;

    const luasLabel = isRange
      ? `${dimMin.luasM2.toFixed(1)}–${dimMax.luasM2.toFixed(1)} m²`
      : `${dimMin.luasM2.toFixed(1)} m²`;

    return {
      ringkasan: {
        estimasiLuasM2: isRange
          ? { min: fmt1(dimMin.luasM2), max: fmt1(dimMax.luasM2) }
          : fmt1(dimMin.luasM2),
        jumlahGuludan: isRange
          ? { min: dimMin.jumlahGuludan.toLocaleString("id-ID"), max: dimMax.jumlahGuludan.toLocaleString("id-ID") }
          : dimMin.jumlahGuludan.toLocaleString("id-ID"),
        panjangPerGuludan: isRange
          ? { min: fmt1(dimMin.panjangPerGuludan), max: fmt1(dimMax.panjangPerGuludan) }
          : fmt1(dimMin.panjangPerGuludan),
      },
      estimasiPopulasi: {
        totalTanaman: isRange
          ? { min: dimMin.tanamanAktual.toLocaleString("id-ID"), max: dimMax.tanamanAktual.toLocaleString("id-ID") }
          : dimMin.tanamanAktual.toLocaleString("id-ID"),
        note: `${notePrefix}, estimasi lahan yang dibutuhkan ${luasLabel} dengan jarak tanam ${jarakLabel}.`,
      },
    };
  }
}

module.exports = new CalculatorService();
