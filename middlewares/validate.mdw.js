const Ajv = require("ajv");

module.exports = (schema) => (req, res, next) => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(req.body);
  if (!valid) {
    return res.status(400).json({
      result: false,
      message: "Not validate",
      data: null,
      error: validate.errors,
  });
  }

  next();
};
