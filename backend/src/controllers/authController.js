const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const AdminProfile = require('../models/AdminProfile');
const generateToken = require('../utils/generateToken');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

// Cookie options for the optional httpOnly cookie flow (in addition to
// returning the token in the JSON body for header-based auth / mobile).
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

const issueAuthResponse = (res, statusCode, user, message, extraData = {}) => {
  const token = generateToken(user._id, user.role);
  res.cookie('token', token, cookieOptions());
  return sendResponse(res, statusCode, {
    message,
    data: { token, user, ...extraData },
  });
};

// @route  POST /api/auth/register/student
// @access Public
const registerStudent = asyncHandler(async (req, res) => {
  const { name, email, password, rollNumber, branch, course, className, section, semester, batch } = req.body;

  const existing = await User.findOne({ email: email?.toLowerCase().trim() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const existingRoll = await StudentProfile.findOne({ rollNumber: rollNumber?.toUpperCase() });
  if (existingRoll) throw new ApiError(409, 'This roll number is already registered');

  const user = await User.create({ name, email, password, role: ROLES.STUDENT });

  const profile = await StudentProfile.create({
    user: user._id,
    rollNumber,
    branch,
    course,
    className,
    section,
    semester: semester ? Number(semester) : undefined,
    batch,
  });

  issueAuthResponse(res, 201, user, 'Student account created', { profile });
});

// @route  POST /api/auth/register/recruiter
// @access Public
const registerRecruiter = asyncHandler(async (req, res) => {
  const { name, email, password, companyName, designation, industry, website, phone } = req.body;

  const existing = await User.findOne({ email: email?.toLowerCase().trim() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ name, email, password, role: ROLES.RECRUITER });

  const profile = await RecruiterProfile.create({
    user: user._id,
    companyName,
    designation,
    industry,
    website,
    phone,
    isApproved: false, // gated: placement cell must approve before login is fully usable
  });

  // Note: no token issued here on purpose — recruiter should see a
  // clear "pending approval" state rather than a working dashboard.
  sendResponse(res, 201, {
    message:
      'Recruiter account created. The placement cell will review your company details before you can log in.',
    data: { user, profile },
  });
});

// @route  POST /api/auth/login
// @access Public (used by all three roles — student, recruiter, admin)
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact the placement cell.');
  }

  let profile = null;
  if (user.role === ROLES.RECRUITER) {
    profile = await RecruiterProfile.findOne({ user: user._id });
    if (profile && !profile.isApproved) {
      throw new ApiError(
        403,
        'Your recruiter account is awaiting approval from the placement cell.'
      );
    }
  } else if (user.role === ROLES.STUDENT) {
    profile = await StudentProfile.findOne({ user: user._id });
  } else if (user.role === ROLES.ADMIN) {
    profile = await AdminProfile.findOne({ user: user._id });
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  issueAuthResponse(res, 200, user, 'Login successful', { profile });
});

// @route  POST /api/auth/logout
// @access Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', cookieOptions());
  sendResponse(res, 200, { message: 'Logged out' });
});

// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  let profile = null;

  if (user.role === ROLES.STUDENT) {
    profile = await StudentProfile.findOne({ user: user._id });
  } else if (user.role === ROLES.RECRUITER) {
    profile = await RecruiterProfile.findOne({ user: user._id });
  } else if (user.role === ROLES.ADMIN) {
    profile = await AdminProfile.findOne({ user: user._id });
  }

  sendResponse(res, 200, { data: { user, profile } });
});

// @route  PUT /api/auth/change-password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword; // pre-save hook re-hashes it
  await user.save();

  sendResponse(res, 200, { message: 'Password updated. Please log in again.' });
});

// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase().trim() });

  // Always respond the same way whether or not the account exists —
  // otherwise this endpoint becomes a way to enumerate registered emails.
  const genericMessage = 'If an account exists for that email, a reset link has been sent.';

  if (!user) {
    return sendResponse(res, 200, { message: genericMessage });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${(process.env.CLIENT_URL || '').split(',')[0]}/reset-password/${rawToken}`;

  const { sendMail } = require('../utils/mailer');
  await sendMail({
    to: user.email,
    subject: 'Reset your NextGen CareerConnect password',
    html: `<p>Hi ${user.name.split(' ')[0]},</p><p>Click the link below to set a new password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
  });

  sendResponse(res, 200, { message: genericMessage });
});

// @route  POST /api/auth/reset-password/:token
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordTokenHash +resetPasswordExpires');

  if (!user) {
    throw new ApiError(400, 'This reset link is invalid or has expired. Request a new one.');
  }

  user.password = newPassword; // pre-save hook re-hashes it
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendResponse(res, 200, { message: 'Password reset. You can now log in with your new password.' });
});

module.exports = {
  registerStudent,
  registerRecruiter,
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
