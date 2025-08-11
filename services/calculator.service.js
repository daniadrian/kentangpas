/**
 * @description Menghitung estimasi kebutuhan bibit berdasarkan parameter lahan.
 * @param {object} params Objek berisi parameter dari input pengguna.
 * @returns {object} Objek berisi hasil kalkulasi yang lengkap.
 */

const crypto = require("crypto");
const calculateSeedNeeds = (params) => {
  const panjangLahan = parseFloat(params.panjangLahan);
  const lebarLahan = parseFloat(params.lebarLahan);
  const lebarGuludan = parseFloat(params.lebarGuludan);
  const lebarParit = parseFloat(params.lebarParit);
  const jarakTanam = parseFloat(params.jarakTanam);

  const { jumlahBibitPerKg, estimasiHarga } = params;

  const lebarUnitTanam = lebarGuludan + lebarParit;
  const jumlahGuludan = Math.floor(lebarLahan / lebarUnitTanam);
  const tanamanPerGuludan = Math.floor(panjangLahan / jarakTanam);
  const totalPopulasiTanaman = jumlahGuludan * tanamanPerGuludan;

  let kebutuhanBibit = 0;
  let unitBibit = "kg";
  if (params.generasiBibit === "G0") {
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

  const result = {
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

  return result;
};

module.exports = {
  calculateSeedNeeds,
};
