const repository = require("../models/calculator.repository");
const { mergeSeedsPerKg, mergePrice } = require("../lib/calculator.helpers");

class CalculatorService {
  getAllSeedParameters() {
    return repository.getAllSeedParameters();
  }

  _computePlantingGrid(dto) {
    const L = dto.panjangLahan;
    const W_field = dto.lebarLahan;
    const W_ridge = dto.lebarGuludan / 100;
    const W_furrow = dto.lebarParit / 100;
    const s = dto.jarakTanam / 100;
    const U = W_ridge + W_furrow;
    const J = Math.floor(W_field / U);
    const sisa = W_field - J * U;
    const J_final = J + (sisa >= 0.75 ? 1 : 0);
    const T_row = Math.floor(L / s) + 1;
    const T_pop = J_final * T_row;
    return { U, J_final, T_row, T_pop };
  }

  _calcReverseDimensions(totalTanaman, jarakTanam, lebarUnitTanam) {
    const targetRasio = 1.5;
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
  }

  async _calculateSeedNeedsKg(dto, gen) {
    const data = await repository.getSeedParamByGeneration(gen);
    const { U, J_final, T_row, T_pop } = this._computePlantingGrid(dto);

    const seeds = mergeSeedsPerKg(gen, dto.jumlahBibitPerKg, data);
    const kg_min = Math.ceil(T_pop / seeds.max);
    const kg_max = Math.ceil(T_pop / seeds.min);
    const kg_est = Math.ceil((kg_min + kg_max) / 2);

    const price = mergePrice(
      gen,
      dto.estimasiHarga,
      dto.estimasiHargaUnit,
      data?.pricePerUnitMin,
      data?.pricePerUnitMax,
      data?.priceUnit
    );

    let biayaLabel = "Tidak dihitung";
    if (price.mode === "single") {
      biayaLabel = `Rp ${(price.priceKg * kg_est).toLocaleString("id-ID")}`;
    } else if (price.mode === "range") {
      biayaLabel = `Rp ${(price.minKg * kg_est).toLocaleString("id-ID")} - Rp ${(
        price.maxKg * kg_est
      ).toLocaleString("id-ID")}`;
    }

    return {
      ringkasanLahan: {
        lebarUnitTanam: `${U.toFixed(2)} meter`,
        jumlahGuludan: `${J_final} baris`,
        panjangTanamPerGuludan: `${dto.panjangLahan.toFixed(2)} meter`,
      },
      kebutuhanTanam: {
        jumlahTanamanPerGuludan: `${T_row} pohon`,
        totalPopulasiTanaman: `${T_pop.toLocaleString("id-ID")} pohon`,
      },
      kebutuhanBibit: {
        estimasi: `${kg_est.toLocaleString("id-ID")} kg (${(kg_est / 100).toFixed(2)} kuintal)`,
        unit: "kg",
        rangeKg: { kg_min, kg_est, kg_max },
        note: "Angka perkiraan. Kebutuhan bisa lebih sedikit/lebih banyak tergantung ukuran umbi (biji/kg).",
      },
      estimasiBiaya: {
        total: biayaLabel,
      },
    };
  }

  async _calculateReverseSeedsKg(dto, gen) {
    const jumlahBibit = dto.jumlahBibit;
    const jarakTanam = dto.jarakTanam / 100;
    const lebarGuludan = dto.lebarGuludan / 100;
    const lebarParit = dto.lebarParit / 100;
    const lebarUnitTanam = lebarGuludan + lebarParit;

    const data = await repository.getSeedParamByGeneration(gen);
    const seeds = mergeSeedsPerKg(gen, dto.jumlahPerKg, data);

    const totalTanamanMin = jumlahBibit * seeds.min;
    const totalTanamanMax = jumlahBibit * seeds.max;

  let seedsLabel;

  if (seeds.min === seeds.max) {
    seedsLabel = `${seeds.min} biji/kg`;
} else {
  seedsLabel = `${seeds.min}–${seeds.max} biji/kg`;
}

const notePrefix =
  `Dengan ${jumlahBibit.toLocaleString("id-ID")} kg bibit ${gen} ` +
  `(estimasi ${seedsLabel})`;

const isRange = totalTanamanMin !== totalTanamanMax;

const dimMin = this._calcReverseDimensions(
  totalTanamanMin,
  jarakTanam,
  lebarUnitTanam
);

let dimMax;

if (isRange) {
  dimMax = this._calcReverseDimensions(
    totalTanamanMax,
    jarakTanam,
    lebarUnitTanam
  );
} else {
  dimMax = dimMin;
}

const fmt1 = (n) =>
  n.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const jarakLabel = `${(jarakTanam * 100).toFixed(0)} cm`;

let luasLabel;

if (isRange) {
  luasLabel =
    `${dimMin.luasM2.toFixed(1)}–` +
    `${dimMax.luasM2.toFixed(1)} m²`;
} else {
  luasLabel = `${dimMin.luasM2.toFixed(1)} m²`;
}
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

  async calculateSeedNeedsG0(dto) {
    const data = await repository.getSeedParamByGeneration("G0");
    const { U, J_final, T_row, T_pop } = this._computePlantingGrid(dto);

    const price = mergePrice(
      "G0",
      dto.estimasiHarga,
      "biji",
      data?.pricePerUnitMin,
      data?.pricePerUnitMax,
      "biji"
    );

    let biayaLabel = "Tidak dihitung";
    if (price.mode === "single") {
      biayaLabel = `Rp ${(price.priceKg * T_pop).toLocaleString("id-ID")}`;
    } else if (price.mode === "range") {
      biayaLabel = `Rp ${(price.minKg * T_pop).toLocaleString("id-ID")} - Rp ${(
        price.maxKg * T_pop
      ).toLocaleString("id-ID")}`;
    }

    return {
      ringkasanLahan: {
        lebarUnitTanam: `${U.toFixed(2)} meter`,
        jumlahGuludan: `${J_final} baris`,
        panjangTanamPerGuludan: `${dto.panjangLahan.toFixed(2)} meter`,
      },
      kebutuhanTanam: {
        jumlahTanamanPerGuludan: `${T_row} pohon`,
        totalPopulasiTanaman: `${T_pop.toLocaleString("id-ID")} pohon`,
      },
      kebutuhanBibit: {
        estimasi: `${T_pop.toLocaleString("id-ID")} biji`,
        unit: "biji",
        rangeKg: null,
        note: "Unit biji (G0). Harga per kg tidak berlaku.",
      },
      estimasiBiaya: {
        total: biayaLabel,
      },
    };
  }

  async calculateSeedNeedsG2(dto) {
    return this._calculateSeedNeedsKg(dto, "G2");
  }

  async calculateSeedNeedsG3(dto) {
    return this._calculateSeedNeedsKg(dto, "G3");
  }

  async calculateReverseSeedsG0(dto) {
    const data = await repository.getSeedParamByGeneration(dto.generasiBibit);
    const jumlahBibit = dto.jumlahBibit;
    const jarakTanam = dto.jarakTanam / 100;
    const lebarGuludan = dto.lebarGuludan / 100;
    const lebarParit = dto.lebarParit / 100;
    const lebarUnitTanam = lebarGuludan + lebarParit;

    const dim = this._calcReverseDimensions(jumlahBibit, jarakTanam, lebarUnitTanam);
    const fmt1 = (n) =>
      n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const jarakLabel = `${(jarakTanam * 100).toFixed(0)} cm`;

    const price = mergePrice(
      dto.generasiBibit,
      null,
      null,
      data?.pricePerUnitMin,
      data?.pricePerUnitMax,
      "biji"
    );

    let biayaLabel = "Tidak dihitung";
    if (price.mode === "single") {
      biayaLabel = `Rp ${(price.priceKg * jumlahBibit).toLocaleString("id-ID")}`;
    } else if (price.mode === "range") {
      biayaLabel = `Rp ${(price.minKg * jumlahBibit).toLocaleString("id-ID")} - Rp ${(
        price.maxKg * jumlahBibit
      ).toLocaleString("id-ID")}`;
    }

    return {
      ringkasan: {
        estimasiLuasM2: fmt1(dim.luasM2),
        jumlahGuludan: dim.jumlahGuludan.toLocaleString("id-ID"),
        panjangPerGuludan: fmt1(dim.panjangPerGuludan),
      },
      estimasiPopulasi: {
        totalTanaman: dim.tanamanAktual.toLocaleString("id-ID"),
        note: `Dengan ${jumlahBibit.toLocaleString("id-ID")} biji bibit G0, estimasi lahan yang dibutuhkan ${dim.luasM2.toFixed(1)} m² dengan jarak tanam ${jarakLabel}.`,
      },
      estimasiBiaya: {
        total: biayaLabel,
      },
    };
  }

  async calculateReverseSeedsG2(dto) {
    return this._calculateReverseSeedsKg(dto, "G2");
  }

  async calculateReverseSeedsG3(dto) {
    return this._calculateReverseSeedsKg(dto, "G3");
  }
}

module.exports = new CalculatorService();
