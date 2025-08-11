/**
 * @file calculator.model.js
 * @description Model untuk mengelola data parameter bibit dari database
 * @version 1.0.0
 */

const pool = require("./db.js");

/**
 * @desc Mengambil semua data parameter bibit dari database
 * @returns {Promise<Object[]>} Array objek parameter bibit
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
    console.error("[Model] Error saat mengambil data parameter bibit:", error);
    throw error;
  }
};

module.exports = {
  getAllSeedParameters,
};
