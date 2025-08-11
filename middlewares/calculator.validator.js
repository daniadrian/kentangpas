const { body, validationResult } = require("express-validator");

const calculateRules = () => {
  return [
    body("panjangLahan")
      .isNumeric()
      .withMessage("Panjang lahan harus berupa angka."),
    body("lebarLahan")
      .isNumeric()
      .withMessage("Lebar lahan harus berupa angka."),
    body("lebarGuludan")
      .isNumeric()
      .withMessage("Lebar guludan harus berupa angka."),
    body("lebarParit")
      .isNumeric()
      .withMessage("Lebar parit (gerandul) harus berupa angka."),
    body("jarakTanam")
      .isNumeric()
      .withMessage("Jarak tanam harus berupa angka."),
    body("jumlahBibitPerKg")
      .optional({ checkFalsy: true })
      .isNumeric()
      .withMessage("Jumlah bibit per kg harus berupa angka."),
    body("estimasiHarga")
      .optional({ checkFalsy: true })
      .isNumeric()
      .withMessage("Estimasi harga harus berupa angka."),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    message: "Input yang diberikan tidak valid.",
    errors: extractedErrors,
  });
};

module.exports = {
  calculateRules,
  validate,
};
