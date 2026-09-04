const jwt = require('jsonwebtoken');

/**
 * Signs a JWT carrying the minimum needed to authorize requests:
 * the user's id and role. Never put the password hash or anything
 * sensitive in here — the payload is base64, not encrypted.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
