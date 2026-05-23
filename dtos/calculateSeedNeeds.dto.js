const Joi = require("joi");

const schema = Joi.object({
  generasiBibit: Joi.string()
    .uppercase()
    .valid("G0", "G2", "G3")
    .required()
    .messages({
      "any.only": "Generasi harus G0, G2, atau G3.",
      "any.required": "Generasi bibit wajib diisi.",
    }),

  panjangLahan: Joi.number().positive().required().messages({
    "number.positive": "Panjang lahan harus angka > 0 (meter).",
    "any.required": "Panjang lahan wajib diisi.",
  }),

  lebarLahan: Joi.number().positive().required().messages({
    "number.positive": "Lebar lahan harus angka > 0 (meter).",
    "any.required": "Lebar lahan wajib diisi.",
  }),

  // input dalam cm, default 80cm
  lebarGuludan: Joi.number().positive().default(80).messages({
    "number.positive": "Lebar guludan harus angka > 0 (cm).",
  }),

  lebarParit: Joi.number().positive().required().messages({
    "number.positive": "Lebar parit harus angka > 0 (cm).",
    "any.required": "Lebar parit wajib diisi.",
  }),

  jarakTanam: Joi.number().positive().required().messages({
    "number.positive": "Jarak tanam harus angka > 0 (cm).",
    "any.required": "Jarak tanam wajib diisi.",
  }),

  jumlahBibitPerKg: Joi.alternatives()
    .try(
      Joi.number().positive(),
      Joi.object({
        min: Joi.number().positive(),
        max: Joi.number().positive(),
      })
    )
    .optional()
    .messages({
      "alternatives.match":
        "jumlahBibitPerKg harus angka atau object berisi min dan max (angka > 0).",
    }),

  estimasiHarga: Joi.number().positive().optional().messages({
    "number.positive": "Estimasi harga harus angka > 0.",
  }),

  estimasiHargaUnit: Joi.string()
    .valid("kg", "kuintal", "biji")
    .optional()
    .messages({
      "any.only": "estimasiHargaUnit harus 'kg', 'kuintal', atau 'biji'.",
    }),
});

module.exports = { schema };
