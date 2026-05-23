const express = require("express");
const router = express.Router();
const calculatorController = require("../controllers/calculator.controller.js");
const {
  validateSeedNeeds,
  validateReverseSeeds,
} = require("../middlewares/calculator.validator.js");

router.get("/", calculatorController.getRoot);
router.get("/parameters", calculatorController.getSeedParameters);

router.post("/calculator", validateSeedNeeds, calculatorController.calculateSeeds);
router.post("/calculator/reverse", validateReverseSeeds, calculatorController.calculateReverseSeedsController);

module.exports = router;
