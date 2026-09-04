const mongoose = require('mongoose');
const { DRIVE_STATUS, JOB_TYPES } = require('../config/constants');

const roundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Online Aptitude", "Technical Interview"
    date: Date,
    description: String,
    order: { type: Number, required: true },
  },
  { _id: true }
);

const driveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPES),
      default: JOB_TYPES.FULL_TIME,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    location: {
      type: String,
      trim: true,
    },
    ctc: {
      // keep as a display string ("₹18 LPA", "₹60,000/mo") so recruiters
      // aren't forced into one currency/format, plus a numeric value
      // (annual, in the smallest sane unit e.g. INR) for sorting/filtering.
      display: { type: String, required: true },
      annualValueINR: { type: Number },
    },
    eligibility: {
      minCgpa: { type: Number, default: 0 },
      maxBacklogs: { type: Number, default: 0 },
      branches: { type: [String], default: [] }, // empty array = all branches
      batches: { type: [Number], default: [] }, // empty array = all batches
    },
    rounds: {
      type: [roundSchema],
      default: [],
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    driveDate: Date,
    status: {
      type: String,
      enum: Object.values(DRIVE_STATUS),
      default: DRIVE_STATUS.DRAFT,
    },
    // The recruiter who owns this posting.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Set when the placement cell publishes a drive that was in "draft".
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    selectedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

driveSchema.index({ status: 1, applicationDeadline: 1 });
// NOTE: these must be separate single-field indexes, not one compound
// index — MongoDB rejects a compound index across two array fields
// ("cannot index parallel arrays") the moment a drive has both
// eligibility.branches and eligibility.batches populated.
driveSchema.index({ 'eligibility.branches': 1 });
driveSchema.index({ 'eligibility.batches': 1 });
driveSchema.index({ title: 'text', company: 'text', jobRole: 'text' });

module.exports = mongoose.model('Drive', driveSchema);
