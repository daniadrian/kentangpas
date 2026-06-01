const CalculatorService = require("../services/calculator.service.js");
const {
  SEED_NEEDS_HANDLERS,
  REVERSE_SEEDS_HANDLERS,
} = require("../lib/calculator.helpers");

const getRoot = (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Kalkulator Tani Bromo siap digunakan!",
    author: "Dani Adrian",
    version: "1.0.0",
    documentation: "/api-docs",
  });
};

const getSeedParameters = async (req, res) => {
  try {
    const parameters = await CalculatorService.getAllSeedParameters();
    res.status(200).json({
      success: true,
      message: "Data parameter bibit berhasil diambil",
      data: parameters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const calculateSeeds = async (req, res) => {
  try {
    const gen = req.dto.generasiBibit;
    const handler = SEED_NEEDS_HANDLERS[gen];

    if (!handler) {
      return res.status(400).json({
        success: false,
        message: `Generasi bibit tidak dikenali: ${gen}`,
      });
    }

    const result = await handler(req.dto);

    return res.status(200).json({
      success: true,
      message: "Perhitungan berhasil dilakukan.",
      data: result,
    });
  } catch (error) {
    console.error("calculateSeeds error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat melakukan perhitungan.",
      error: error.message,
    });
  }
};

const calculateReverseSeedsController = async (req, res) => {
  try {
    const gen = req.dto.generasiBibit;
    const handler = REVERSE_SEEDS_HANDLERS[gen];

    if (!handler) {
      return res.status(400).json({
        success: false,
        message: `Generasi bibit tidak dikenali: ${gen}`,
      });
    }

    const result = await handler(req.dto);

    return res.status(200).json({
      success: true,
      message: "Perhitungan reverse berhasil",
      data: result,
    });
  } catch (error) {
    console.error("calculateReverseSeedsController error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat melakukan perhitungan reverse.",
      error: error.message,
    });
  }
};

module.exports = {
  getRoot,
  getSeedParameters,
  calculateSeeds,
  calculateReverseSeedsController,
};
