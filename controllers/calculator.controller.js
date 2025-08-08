const CalculatorModel = require("./models/calculator.model.js");
const CalculatorService = require("./services/calculator.service.js");

const getRoot = (req, res) => {
  res.status(200).json({
    message: "API Kalkulator Tani Bromo siap digunakan!",
    author: "Dai Adrian",
    version: "1.0.0",
    documentation: "/api-docs",
  });
};

/**
 * @description Controller untuk mendapatkan semua parameter bibit
 */
const getSeedParameters = async (req, res) => {
  try {
    const parameters = await CalculatorModel.getAllSeedParameters();
    res.status(200).json({
      message: "Data parameter bibit berhasil diambil",
      data: parameters,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * @description Controller untuk menjalankan kalkulasi kebutuhan bibit
 */
const calculateSeeds = (req, res) => {
  try {
    const result = CalculatorService.calculateSeedNeeds(req.body);
    res.status(200).json({
      message: "Perhitungan berhasil dilakukan.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server saat melakukan perhitungan.",
      error: error.message,
    });
  }
};

module.exports = {
  getRoot,
  getSeedParameters,
  calculateSeeds,
};
