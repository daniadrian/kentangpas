/**
 * @file calculator.validator.js
 * @description Middleware validasi input untuk kalkulasi kebutuhan bibit
 * @version 1.0.0
 */

const { body, validationResult } = require("express-validator");

/**
 * @desc Aturan validasi untuk endpoint kalkulasi kebutuhan bibit
 * @returns {import('express-validator').ValidationChain[]}
 */
const calculateRules = () => [
  body("panjangLahan")
    .isNumeric()
    .withMessage("Panjang lahan harus berupa angka."),
  body("lebarLahan").isNumeric().withMessage("Lebar lahan harus berupa angka."),
  body("lebarGuludan")
    .isNumeric()
    .withMessage("Lebar guludan harus berupa angka."),
  body("lebarParit")
    .isNumeric()
    .withMessage("Lebar parit (gerandul) harus berupa angka."),
  body("jarakTanam").isNumeric().withMessage("Jarak tanam harus berupa angka."),
  body("jumlahBibitPerKg")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Jumlah bibit per kg harus berupa angka."),
  body("estimasiHarga")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Estimasi harga harus berupa angka."),
];

/**
 * @desc Middleware untuk menangani hasil validasi
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    field: err.param,
    message: err.msg,
  }));

  return res.status(422).json({
    success: false,
    message: "Input yang diberikan tidak valid.",
    errors: extractedErrors,
  });
};

module.exports = {
  calculateRules,
  validate,
};
