const mongoose = require('mongoose');
const { APPLICATION_STATUS, ATTENDANCE_STATUS } = require('../config/constants');

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(APPLICATION_STATUS), required: true },
    remarks: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
    },
    currentRoundIndex: {
      // -1 = not yet through any round; index into the Drive's rounds array
      type: Number,
      default: -1,
    },
    // Whether the student showed up on the drive day — separate from
    // application status, since a student can be "shortlisted" but still
    // marked absent if they don't turn up.
    attendance: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.NOT_MARKED,
    },
    interviewGiven: {
      type: Boolean,
      default: false,
    },
    resumeUrlSnapshot: {
      // capture the resume used *at the time of applying*, since a
      // student might update their resume later for a different drive.
      type: String,
    },
    coverNote: {
      type: String,
      maxlength: 1000,
    },
    history: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// A student can only apply once per drive.
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });
applicationSchema.index({ drive: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
