const calculateSeedNeeds = (params) => {
  const L = Number(params.panjangLahan);
  const W_field = Number(params.lebarLahan);
  const W_ridge = params.lebarGuludan ? Number(params.lebarGuludan) / 100 : 0.8;
  const W_furrow = Number(params.lebarParit) / 100;
  const s = Number(params.jarakTanam) / 100;
  const gen = params.generasiBibit;

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

  let kebutuhan;
  let unitBibit;
  let detailKg = null;

  if (gen === "G0") {
    kebutuhan = T_pop;
    unitBibit = "biji";
  } else {
    const b = params.jumlahBibitPerKg;
    const b_min = b?.min ?? Number(params.jumlahBibitPerKg);
    const b_med = b?.med ?? Number(params.jumlahBibitPerKg);
    const b_max = b?.max ?? Number(params.jumlahBibitPerKg);

    const kg_min = Math.ceil(T_pop / (b_max || b_med));
    const kg_med = Math.ceil(T_pop / (b_med || b_min));
    const kg_max = Math.ceil(T_pop / (b_min || b_med));

    const packKg = 10;
    const kg_min_pack = Math.ceil(kg_min / packKg) * packKg;
    const kg_med_pack = Math.ceil(kg_med / packKg) * packKg;
    const kg_max_pack = Math.ceil(kg_max / packKg) * packKg;

    detailKg = {
      kg_min,
      kg_med,
      kg_max,
      kg_min_pack,
      kg_med_pack,
      kg_max_pack,
    };
    kebutuhan = kg_med;
    unitBibit = "kg";
  }

  let totalEstimasiBiaya = "Tidak dihitung";
  if (unitBibit === "kg" && params.estimasiHarga) {
    const harga = Number(params.estimasiHarga);
    if (Number.isFinite(harga) && harga > 0) {
      totalEstimasiBiaya = `Rp. ${(kebutuhan * harga).toLocaleString("id-ID")}`;
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
      estimasi: `${kebutuhan.toLocaleString("id-ID")} ${unitBibit}`,
      estimasiKuintal:
        unitBibit === "kg" ? `${(kebutuhan / 100).toFixed(2)} kuintal` : null,
      rangeKg: detailKg,
      note:
        unitBibit === "kg"
          ? "Angka perkiraan. Kebutuhan bisa lebih sedikit/lebih banyak tergantung ukuran umbi (biji/kg)."
          : "Unit biji (G0). Harga per kg tidak berlaku.",
    },
    estimasiBiaya: {
      total: totalEstimasiBiaya,
    },
  };
};
