const { body } = require('express-validator');

const createDriveValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('jobRole').trim().notEmpty().withMessage('Job role is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('ctc.display').trim().notEmpty().withMessage('CTC display value is required'),
  body('applicationDeadline').isISO8601().withMessage('Valid application deadline is required'),
  body('eligibility.minCgpa').optional().isFloat({ min: 0, max: 10 }),
  body('eligibility.maxBacklogs').optional().isInt({ min: 0 }),
];

module.exports = { createDriveValidator };
