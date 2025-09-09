const { body, validationResult } = require("express-validator");

const isPositiveNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

const calculateRules = () => {
  return [
    body("generasiBibit")
      .exists()
      .withMessage("Generasi bibit wajib diisi.")
      .isIn(["G0", "G2", "G3"])
      .withMessage("Generasi harus G0, G2, atau G3."),

    body("panjangLahan")
      .custom(isPositiveNumber)
      .withMessage("Panjang lahan harus angka > 0 (meter)."),

    body("lebarLahan")
      .custom(isPositiveNumber)
      .withMessage("Lebar lahan harus angka > 0 (meter)."),

    body("lebarGuludan")
      .optional({ nullable: true })
      .custom(isPositiveNumber)
      .withMessage("Lebar guludan harus angka > 0 (cm)."),

    body("lebarParit")
      .custom(isPositiveNumber)
      .withMessage("Lebar parit (gerandul) harus angka > 0 (cm)."),

    body("jarakTanam")
      .custom(isPositiveNumber)
      .withMessage("Jarak tanam harus angka > 0 (cm)."),

    body("jumlahBibitPerKg")
      .optional({ nullable: true })
      .custom((val) => {
        if (typeof val === "undefined" || val === null || val === "")
          return true;
        if (typeof val === "number") return isPositiveNumber(val);
        if (typeof val === "string") return isPositiveNumber(val);
        if (typeof val === "object") {
          const { min, max } = val;
          const okMin = typeof min === "undefined" || isPositiveNumber(min);
          const okMax = typeof max === "undefined" || isPositiveNumber(max);
          return okMin && okMax;
        }
        return false;
      })
      .withMessage(
        "jumlahBibitPerKg harus angka atau object {min,max} berisi angka > 0."
      ),

    body("estimasiHarga")
      .optional({ nullable: true })
      .custom(isPositiveNumber)
      .withMessage("Estimasi harga harus angka > 0."),

    body("estimasiHargaUnit")
      .optional({ nullable: true })
      .isIn(["kg", "kuintal", "biji"])
      .withMessage("estimasiHargaUnit harus 'kg', 'kuintal', atau 'biji'."),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extractedErrors = errors
    .array()
    .map((err) => ({ [err.param]: err.msg }));
  return res.status(422).json({
    message: "Input yang diberikan tidak valid.",
    errors: extractedErrors,
  });
};

module.exports = {
  calculateRules,
  validate,
};
