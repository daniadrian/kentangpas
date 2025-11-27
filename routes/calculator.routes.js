const express = require("express");
const router = express.Router();
const calculatorController = require("../controllers/calculator.controller.js");
const {
  calculateRules,
  calculateReverseRules,
  validate,
} = require("../middlewares/calculator.validator.js");

router.get("/", calculatorController.getRoot);
router.get("/parameters", calculatorController.getSeedParameters);

router.post(
  "/calculator",
  calculateRules(),
  validate,
  calculatorController.calculateSeeds
);

router.post(
  "/calculator/generate",
  calculateRules(),
  validate,
  calculatorController.calculateSeeds
);

router.post(
  "/calculator/reverse",
  calculateReverseRules(),
  validate,
  calculatorController.calculateReverseSeedsController
);

module.exports = router;
