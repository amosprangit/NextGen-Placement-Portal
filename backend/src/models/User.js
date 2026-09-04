const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

/**
 * One User collection backs all three roles. Role-specific data
 * (branch, CGPA, company name, etc.) lives in StudentProfile /
 * RecruiterProfile, one-to-one linked back to this document.
 * Admin needs no extra profile — the User doc is enough.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never returned by default on .find()/.findOne()
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // admin can deactivate an account without deleting it
    },
    lastLoginAt: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    // Forgot-password flow: a hashed, time-limited token. We store the
    // SHA-256 hash (not the raw token) so a database leak alone can't be
    // used to reset anyone's password — the raw token only ever exists
    // in the emailed link.
    resetPasswordTokenHash: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash the password whenever it's set/changed — never store plaintext.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Strip password/version key whenever a user doc is serialized to JSON.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
