const pool = require("./db.js");

/**
 * @description Mengambil semua data parameter bibit dari database
 * @returns {Promise<Array>} Sebuah array berisi objek parameter bibit
 */
const getAllSeedParameters = async () => {
  try {
    const query =
      "SELECT id, generation_name, seeds_per_kg_min, seeds_per_kg_max, price_per_unit_min, price_per_unit_max, price_unit FROM seed_parameters ORDER BY id ASC";
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error saat mengambil data parameter bibit:", error);
    throw error;
  }
};

module.exports = {
  getAllSeedParameters,
};
