const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  registerStudent,
  registerRecruiter,
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerStudentValidator,
  registerRecruiterValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidators');

const router = express.Router();

// Auth endpoints are the most brute-forceable in the app — rate limit them
// separately (and more tightly) than the general API limiter.
const authLimiter = rateLimit({
  windowMs: (parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MIN, 10) || 15) * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.post('/register/student', authLimiter, registerStudentValidator, validate, registerStudent);
router.post('/register/recruiter', authLimiter, registerRecruiterValidator, validate, registerRecruiter);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordValidator, validate, changePassword);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidator, validate, resetPassword);

module.exports = router;
