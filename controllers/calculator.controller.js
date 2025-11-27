const CalculatorModel = require("../models/calculator.model.js");
const { calculateSeedNeeds, calculateReverseSeeds } = require("../services/calculator.service.js");

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
    const parameters = await CalculatorModel.getAllSeedParameters();
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
    if (typeof req.body.generasiBibit === "string") {
      req.body.generasiBibit = req.body.generasiBibit.toUpperCase();
    }
    if (typeof req.body.estimasiHargaUnit === "string") {
      req.body.estimasiHargaUnit = req.body.estimasiHargaUnit.toLowerCase();
    }

    const dbParam = await CalculatorModel.getSeedParamByGeneration(
      req.body.generasiBibit
    );

    const result = calculateSeedNeeds(req.body, dbParam);

    if (result && result.error) {
      return res.status(400).json({
        success: false,
        message: "Input tidak valid.",
        error: result.error,
      });
    }

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
    if (typeof req.body.generasiBibit === "string") {
      req.body.generasiBibit = req.body.generasiBibit.toUpperCase();
    }

    const result = calculateReverseSeeds(req.body);

    if (result && result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null,
      });
    }

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
