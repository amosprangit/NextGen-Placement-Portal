const mongoose = require('mongoose');

/**
 * Kept as its own collection (rather than bolting fields onto User) so the
 * three roles stay symmetric: every role's extra details live in a profile
 * doc 1:1 with its User. Created automatically whenever an admin account
 * is created (seed script or the "create another admin" endpoint).
 */
const adminProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    designation: {
      type: String,
      trim: true,
      default: 'Placement Cell Officer',
    },
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    createdBy: {
      // which admin created this admin account (null for the seeded root admin)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
