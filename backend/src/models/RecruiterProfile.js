const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    companyLogoUrl: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      maxlength: 2000,
    },
    // Recruiters must be vetted by the placement cell before they can
    // post drives or see student data — this is the gate for that.
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

recruiterProfileSchema.index({ companyName: 1 });

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
