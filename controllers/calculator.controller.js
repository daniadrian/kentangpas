/**
 * @file calculator.controller.js
 * @description Controller untuk API Kalkulator Tani Bromo
 * @version 1.0.0
 * @author
 * Dani Adrian
 */

const CalculatorModel = require("../models/calculator.model.js");
const CalculatorService = require("../services/calculator.service.js");

/**
 * @desc Endpoint root API untuk menampilkan informasi dasar
 * @route GET /
 * @access Public
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
const getRoot = (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Kalkulator Tani Bromo siap digunakan!",
    author: "Dai Adrian",
    version: "1.0.0",
    documentation: "/api-docs",
  });
};

/**
 * @desc Mendapatkan semua parameter bibit dari database
 * @route GET /api/seeds/parameters
 * @access Public
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getSeedParameters = async (req, res) => {
  try {
    const parameters = await CalculatorModel.getAllSeedParameters();
    res.status(200).json({
      success: true,
      message: "Data parameter bibit berhasil diambil",
      data: parameters,
    });
  } catch (error) {
    // Bisa gunakan logger di sini
    // logger.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Menjalankan kalkulasi kebutuhan bibit
 * @route POST /api/seeds/calculate
 * @access Public
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {void}
 */
const calculateSeeds = (req, res) => {
  try {
    const result = CalculatorService.calculateSeedNeeds(req.body);
    res.status(200).json({
      success: true,
      message: "Perhitungan berhasil dilakukan.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat melakukan perhitungan.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getRoot,
  getSeedParameters,
  calculateSeeds,
};
