/**
 * @file calculator.routes.js
 * @description Routing untuk fitur kalkulator bibit
 * @version 1.0.0
 */

const express = require("express");
const calculatorController = require("../controllers/calculator.controller.js");
const {
  calculateRules,
  validate,
} = require("../middlewares/calculator.validator.js");

const router = express.Router();

/**
 * @route GET /calculator
 * @desc Endpoint root API kalkulator
 * @access Public
 */
router.get("/", calculatorController.getRoot);

/**
 * @route GET /calculator/parameters
 * @desc Mendapatkan semua parameter bibit
 * @access Public
 */
router.get("/parameters", calculatorController.getSeedParameters);

/**
 * @route POST /calculator/calculate
 * @desc Melakukan perhitungan kebutuhan bibit
 * @access Public
 */
router.post(
  "/calculate",
  calculateRules(),
  validate,
  calculatorController.calculateSeeds
);

module.exports = router;
