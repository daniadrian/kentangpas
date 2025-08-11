/**
 * @file calculator.service.js
 * @description Service untuk perhitungan estimasi kebutuhan bibit
 * @version 1.0.0
 */

/**
 * @desc Menghitung estimasi kebutuhan bibit berdasarkan parameter lahan
 * @param {Object} params - Parameter dari input pengguna
 * @param {number|string} params.panjangLahan - Panjang lahan (meter)
 * @param {number|string} params.lebarLahan - Lebar lahan (meter)
 * @param {number|string} params.lebarGuludan - Lebar guludan (meter)
 * @param {number|string} params.lebarParit - Lebar parit/gerandul (meter)
 * @param {number|string} params.jarakTanam - Jarak tanam (meter)
 * @param {number|string} [params.jumlahBibitPerKg] - Opsional, jumlah bibit per kg
 * @param {number|string} [params.estimasiHarga] - Opsional, estimasi harga per unit bibit
 * @param {string} [params.generasiBibit] - Generasi bibit (misal: G0)
 * @returns {Object} Hasil kalkulasi
 */
const calculateSeedNeeds = (params) => {
  const panjangLahan = parseFloat(params.panjangLahan);
  const lebarLahan = parseFloat(params.lebarLahan);
  const lebarGuludan = parseFloat(params.lebarGuludan);
  const lebarParit = parseFloat(params.lebarParit);
  const jarakTanam = parseFloat(params.jarakTanam);

  const { jumlahBibitPerKg, estimasiHarga, generasiBibit } = params;

  const lebarUnitTanam = lebarGuludan + lebarParit;
  const jumlahGuludan = Math.floor(lebarLahan / lebarUnitTanam);
  const tanamanPerGuludan = Math.floor(panjangLahan / jarakTanam);
  const totalPopulasiTanaman = jumlahGuludan * tanamanPerGuludan;

  let kebutuhanBibit = 0;
  let unitBibit = "kg";
  if (generasiBibit === "G0") {
    kebutuhanBibit = totalPopulasiTanaman;
    unitBibit = "biji";
  } else {
    kebutuhanBibit = totalPopulasiTanaman / parseFloat(jumlahBibitPerKg);
    kebutuhanBibit = Math.ceil(kebutuhanBibit);
  }

  let totalEstimasiBiaya = 0;
  if (estimasiHarga) {
    totalEstimasiBiaya = kebutuhanBibit * parseFloat(estimasiHarga);
  }

  return {
    ringkasanLahan: {
      lebarUnitTanam: `${lebarUnitTanam.toFixed(2)} meter`,
      jumlahGuludan: `${jumlahGuludan} baris`,
      panjangTanamPerGuludan: `${panjangLahan} meter`,
    },
    kebutuhanTanam: {
      jumlahTanamanPerGuludan: `${tanamanPerGuludan} pohon`,
      totalPopulasiTanaman: `${totalPopulasiTanaman} pohon`,
    },
    kebutuhanBibit: {
      estimasi: `${kebutuhanBibit.toLocaleString("id-ID")} ${unitBibit}`,
      estimasiKuintal:
        unitBibit === "kg"
          ? `${(kebutuhanBibit / 100).toFixed(2)} kuintal`
          : null,
    },
    estimasiBiaya: {
      total:
        totalEstimasiBiaya > 0
          ? `Rp. ${totalEstimasiBiaya.toLocaleString("id-ID")}`
          : "Tidak dihitung",
    },
  };
};

module.exports = {
  calculateSeedNeeds,
};
