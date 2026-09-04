const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { ApiError } = require('../utils/apiResponse');
const User = require('../models/User');

/**
 * Verifies the Bearer JWT and attaches the authenticated user to req.user.
 * We re-fetch the user (minus password) on every request rather than
 * trusting the token payload alone, so a deactivated account or role
 * change takes effect immediately instead of waiting for token expiry.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized — no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authorized — invalid or expired token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'Not authorized — user no longer exists');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact the placement cell.');
  }

  req.user = user; // full mongoose doc, password excluded via select:false
  next();
});

/**
 * Role gate — use after `protect`. Example: authorize('admin', 'recruiter').
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not permitted to perform this action`);
    }
    next();
  };
};

module.exports = { protect, authorize };
