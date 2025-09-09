const pool = require("./db.js");

/**
 * @description Ambil semua parameter bibit (untuk admin/monitoring)
 */
const getAllSeedParameters = async () => {
  try {
    const query = `
      SELECT
        id,
        generation_name,
        seeds_per_kg_min,
        seeds_per_kg_max,
        price_per_unit_min,
        price_per_unit_max,
        price_unit
      FROM seed_parameters
      ORDER BY id ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error saat mengambil data parameter bibit:", error);
    throw error;
  }
};

/**
 * @description Ambil parameter bibit berdasarkan generasi (G0/G2/G3)
 * @param {string} generationName
 * @returns {Promise<Object|null>}
 */
const getSeedParamByGeneration = async (generationName) => {
  try {
    const query = `
      SELECT
        generation_name,
        seeds_per_kg_min,
        seeds_per_kg_max,
        price_per_unit_min,
        price_per_unit_max,
        price_unit
      FROM seed_parameters
      WHERE UPPER(generation_name) = UPPER($1)
      LIMIT 1
    `;
    const result = await pool.query(query, [generationName]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error saat mengambil parameter bibit by generation:", error);
    throw error;
  }
};

module.exports = {
  getAllSeedParameters,
  getSeedParamByGeneration,
};
