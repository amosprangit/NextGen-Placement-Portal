const asyncHandler = require('express-async-handler');
const Drive = require('../models/Drive');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Application = require('../models/Application');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const { ROLES, DRIVE_STATUS } = require('../config/constants');

// A student is eligible if their CGPA/backlogs/branch/batch satisfy the
// drive's criteria. Empty branches/batches arrays mean "open to all".
const isStudentEligible = (drive, student) => {
  const { eligibility } = drive;
  if (student.cgpa < eligibility.minCgpa) return false;
  if (student.backlogs > eligibility.maxBacklogs) return false;
  if (eligibility.branches.length && !eligibility.branches.includes(student.branch)) return false;
  if (eligibility.batches.length && !eligibility.batches.includes(student.batch)) return false;
  return true;
};

// @route  POST /api/drives
// @access Private (recruiter[approved] or admin)
const createDrive = asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.RECRUITER) {
    const recruiterProfile = await RecruiterProfile.findOne({ user: req.user._id });
    if (!recruiterProfile?.isApproved) {
      throw new ApiError(403, 'Your recruiter account must be approved before posting drives');
    }
  }

  const drive = await Drive.create({
    ...req.body,
    createdBy: req.user._id,
    // Recruiters submit as draft; the placement cell publishes it.
    // Admin-created drives can go straight to upcoming/open.
    status: req.user.role === ROLES.ADMIN ? req.body.status || DRIVE_STATUS.UPCOMING : DRIVE_STATUS.DRAFT,
  });

  sendResponse(res, 201, { message: 'Drive created', data: drive });
});

// @route  GET /api/drives
// @access Private (all roles — result set differs per role)
const listDrives = asyncHandler(async (req, res) => {
  const { status, jobType, search, eligibleOnly } = req.query;
  const filter = {};

  if (req.user.role === ROLES.RECRUITER) {
    // Recruiters only ever see their own postings.
    filter.createdBy = req.user._id;
  } else if (req.user.role === ROLES.STUDENT) {
    // Students never see drafts.
    filter.status = { $in: [DRIVE_STATUS.UPCOMING, DRIVE_STATUS.OPEN, DRIVE_STATUS.CLOSED, DRIVE_STATUS.COMPLETED] };
  }

  if (status) filter.status = status;
  if (jobType) filter.jobType = jobType;
  if (search) filter.$text = { $search: search };

  const { page, limit, skip } = getPagination(req.query);

  let [drives, total] = await Promise.all([
    Drive.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Drive.countDocuments(filter),
  ]);

  // Optionally narrow to only the drives *this* student is eligible for.
  if (req.user.role === ROLES.STUDENT && eligibleOnly === 'true') {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (studentProfile) {
      drives = drives.filter((d) => isStudentEligible(d, studentProfile));
    }
  }

  sendResponse(res, 200, { data: drives, meta: buildMeta({ page, limit, total }) });
});

// @route  GET /api/drives/:id
// @access Private (all roles)
const getDriveById = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id).populate('createdBy', 'name email role');
  if (!drive) throw new ApiError(404, 'Drive not found');

  let eligible = null;
  let alreadyApplied = false;
  let postedBy = null;

  if (req.user.role === ROLES.STUDENT) {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (studentProfile) {
      eligible = isStudentEligible(drive, studentProfile);
      alreadyApplied = Boolean(
        await Application.exists({ student: studentProfile._id, drive: drive._id })
      );
    }
  } else {
    // Admin and the owning recruiter get the full "who posted this and
    // what company do they represent" picture for the detail view.
    const recruiterProfile = await RecruiterProfile.findOne({ user: drive.createdBy?._id });
    postedBy = { user: drive.createdBy, recruiterProfile };
  }

  sendResponse(res, 200, { data: { drive, eligible, alreadyApplied, postedBy } });
});

const assertDriveOwnership = (drive, user) => {
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.RECRUITER && String(drive.createdBy) === String(user._id)) return;
  throw new ApiError(403, 'You do not have permission to modify this drive');
};

// @route  PUT /api/drives/:id
// @access Private (owning recruiter or admin)
const updateDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) throw new ApiError(404, 'Drive not found');
  assertDriveOwnership(drive, req.user);

  const disallowed = ['createdBy', 'applicationsCount', 'selectedCount'];
  const updates = { ...req.body };
  disallowed.forEach((f) => delete updates[f]);

  Object.assign(drive, updates);
  await drive.save();

  sendResponse(res, 200, { message: 'Drive updated', data: drive });
});

// @route  PATCH /api/drives/:id/status
// @access Private (owning recruiter or admin) — e.g. publish a draft, close applications
const updateDriveStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!Object.values(DRIVE_STATUS).includes(status)) {
    throw new ApiError(400, 'Invalid drive status');
  }

  const drive = await Drive.findById(req.params.id);
  if (!drive) throw new ApiError(404, 'Drive not found');
  assertDriveOwnership(drive, req.user);

  drive.status = status;
  if (req.user.role === ROLES.ADMIN && status !== DRIVE_STATUS.DRAFT) {
    drive.approvedBy = req.user._id;
  }
  await drive.save();

  sendResponse(res, 200, { message: `Drive marked as ${status}`, data: drive });
});

// @route  GET /api/drives/:id/analytics
// @access Private (owning recruiter or admin) — feeds the chart on the drive detail page
const getDriveAnalytics = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) throw new ApiError(404, 'Drive not found');
  assertDriveOwnership(drive, req.user);

  const [totalRegistered, present, absent, interviewGiven, statusCounts] = await Promise.all([
    Application.countDocuments({ drive: drive._id }),
    Application.countDocuments({ drive: drive._id, attendance: 'present' }),
    Application.countDocuments({ drive: drive._id, attendance: 'absent' }),
    Application.countDocuments({ drive: drive._id, interviewGiven: true }),
    Application.aggregate([
      { $match: { drive: drive._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const statusBreakdown = statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

  sendResponse(res, 200, {
    data: {
      totalRegistered,
      present,
      absent,
      notMarked: totalRegistered - present - absent,
      interviewGiven,
      notInterviewed: totalRegistered - interviewGiven,
      statusBreakdown,
    },
  });
});

// @route  DELETE /api/drives/:id
// @access Private (owning recruiter or admin)
const deleteDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) throw new ApiError(404, 'Drive not found');
  assertDriveOwnership(drive, req.user);

  await Application.deleteMany({ drive: drive._id });
  await drive.deleteOne();

  sendResponse(res, 200, { message: 'Drive deleted' });
});

module.exports = {
  createDrive,
  listDrives,
  getDriveById,
  updateDrive,
  updateDriveStatus,
  getDriveAnalytics,
  deleteDrive,
  isStudentEligible,
};
