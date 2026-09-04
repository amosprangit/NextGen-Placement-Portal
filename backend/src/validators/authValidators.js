const { body } = require('express-validator');

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain an uppercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain a number');

const registerStudentValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  passwordRule,
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('branch').trim().notEmpty().withMessage('Branch is required'),
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('batch').isInt({ min: 2000, max: 2100 }).withMessage('Valid batch year is required'),
  body('semester').optional({ checkFalsy: true }).isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
];

const registerRecruiterValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  passwordRule,
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain a number'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordValidator = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain a number'),
];

module.exports = {
  registerStudentValidator,
  registerRecruiterValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
