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
  "/calculate",
  calculateRules(),
  validate,
  calculatorController.calculateSeeds
);
router.post(
  "/calculate/reverse",
  calculateReverseRules(),
  validate,
  calculatorController.calculateReverseSeedsController
);

module.exports = router;
