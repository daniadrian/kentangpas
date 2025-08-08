const express = require("express");
const router = express.Router();
const calculatorController = require("./controllers/calculator.controller.js");
const {
  calculateRules,
  validate,
} = require("./middlewares/calculator.validator.js");

router.get("/", calculatorController.getRoot);
router.get("/parameters", calculatorController.getSeedParameters);
router.post(
  "/calculate",
  calculateRules(),
  validate,
  calculatorController.calculateSeeds
);

module.exports = router;
