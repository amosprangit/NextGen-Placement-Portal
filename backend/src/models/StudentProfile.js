const mongoose = require('mongoose');
const { PLACEMENT_STATUS } = require('../config/constants');

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    // Degree program — distinct from `branch` (specialization). e.g. a
    // student's course is "B.Tech" and their branch is "Computer Science".
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    className: {
      // e.g. "TY-A", "Final Year" — free text, college-specific naming
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
    },
    batch: {
      // graduating year, e.g. 2027
      type: Number,
      required: [true, 'Batch year is required'],
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    backlogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    dateOfBirth: Date,
    address: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String, // path served from /uploads/resumes/...
      default: null,
    },
    // No-Objection Certificate — required by many universities before a
    // student can accept an off-campus / another-department offer.
    nocUrl: {
      type: String,
      default: null,
    },
    nocUploadedAt: {
      type: Date,
      default: null,
    },
    links: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
    placementStatus: {
      type: String,
      enum: Object.values(PLACEMENT_STATUS),
      default: PLACEMENT_STATUS.UNPLACED,
    },
    placedIn: {
      // set once a student accepts a selected offer
      drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
      company: String,
      ctc: String,
      placedAt: Date,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

studentProfileSchema.index({ branch: 1, batch: 1, cgpa: 1 });
studentProfileSchema.index({ course: 1 });

// Keep a simple derived flag so drive-eligibility queries and the
// dashboard "complete your profile" nudge don't need to recompute this.
studentProfileSchema.pre('save', function flagCompleteness(next) {
  this.isProfileComplete = Boolean(
    this.rollNumber && this.branch && this.course && this.batch && this.cgpa >= 0 && this.resumeUrl
  );
  next();
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
