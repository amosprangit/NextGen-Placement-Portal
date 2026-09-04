const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiResponse');

/**
 * Run this after an array of express-validator checks to turn any
 * failures into a single consistent 400 response.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      'Validation failed',
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};

module.exports = validate;
