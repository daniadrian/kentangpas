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

  jumlahBibit: Joi.number().positive().required().messages({
    "number.positive":
      "Jumlah bibit harus angka > 0 (biji untuk G0, kg untuk G2/G3).",
    "any.required": "Jumlah bibit wajib diisi.",
  }),

  jarakTanam: Joi.number().positive().required().messages({
    "number.positive": "Jarak tanam harus angka > 0 (cm).",
    "any.required": "Jarak tanam wajib diisi.",
  }),

  // input dalam cm, default 80cm
  lebarGuludan: Joi.number().positive().default(80).messages({
    "number.positive": "Lebar guludan harus angka > 0 (cm).",
  }),

  lebarParit: Joi.number().positive().required().messages({
    "number.positive": "Lebar parit harus angka > 0 (cm).",
    "any.required": "Lebar parit wajib diisi.",
  }),

  jumlahPerKg: Joi.number().positive().optional().messages({
    "number.positive": "jumlahPerKg harus angka > 0 (jumlah umbi per kg).",
  }),
});

module.exports = { schema };
