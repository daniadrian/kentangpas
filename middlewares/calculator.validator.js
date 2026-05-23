const { schema: seedNeedsSchema } = require("../dtos/calculateSeedNeeds.dto");
const { schema: reverseSeedsSchema } = require("../dtos/calculateReverseSeeds.dto");

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    return res.status(422).json({
      message: "Input yang diberikan tidak valid.",
      errors: error.details.map((d) => ({ [d.path.join(".")]: d.message })),
    });
  }

  req.dto = value;
  next();
};

module.exports = {
  validateSeedNeeds: validate(seedNeedsSchema),
  validateReverseSeeds: validate(reverseSeedsSchema),
};
