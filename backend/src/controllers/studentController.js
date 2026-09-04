const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');

// @route  GET /api/students/me
// @access Private (student)
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id }).populate(
    'placedIn.drive',
    'title company'
  );
  if (!profile) throw new ApiError(404, 'Student profile not found');
  sendResponse(res, 200, { data: profile });
});

// @route  PUT /api/students/me
// @access Private (student)
const updateMyProfile = asyncHandler(async (req, res) => {
  const disallowed = ['user', 'placementStatus', 'placedIn', 'rollNumber'];
  const updates = { ...req.body };
  disallowed.forEach((f) => delete updates[f]);

  // multipart/form-data (used here so the resume file can ride along)
  // only carries flat string fields — array/object fields are sent as
  // JSON strings by the client and need to be parsed back out.
  ['skills', 'links'].forEach((field) => {
    if (typeof updates[field] === 'string') {
      try {
        updates[field] = JSON.parse(updates[field]);
      } catch {
        delete updates[field]; // ignore malformed payloads rather than 500ing
      }
    }
  });

  ['cgpa', 'backlogs', 'batch'].forEach((field) => {
    if (updates[field] !== undefined && updates[field] !== '') updates[field] = Number(updates[field]);
  });

  if (req.files?.resume?.[0]) {
    updates.resumeUrl = `/uploads/resumes/${req.files.resume[0].filename}`;
  }
  if (req.files?.noc?.[0]) {
    updates.nocUrl = `/uploads/noc/${req.files.noc[0].filename}`;
    updates.nocUploadedAt = new Date();
  }

  const profile = await StudentProfile.findOneAndUpdate({ user: req.user._id }, updates, {
    new: true,
    runValidators: true,
  });
  if (!profile) throw new ApiError(404, 'Student profile not found');

  sendResponse(res, 200, { message: 'Profile updated', data: profile });
});

// @route  GET /api/students
// @access Private (admin) — searchable, filterable, paginated roster
const listStudents = asyncHandler(async (req, res) => {
  const { branch, course, batch, placementStatus, minCgpa, search, nocStatus } = req.query;
  const filter = {};

  if (branch) filter.branch = branch;
  if (course) filter.course = course;
  if (batch) filter.batch = Number(batch);
  if (placementStatus) filter.placementStatus = placementStatus;
  if (minCgpa) filter.cgpa = { $gte: Number(minCgpa) };
  if (nocStatus === 'uploaded') filter.nocUrl = { $ne: null };
  if (nocStatus === 'missing') filter.nocUrl = null;
  if (search) {
    filter.$or = [
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const { page, limit, skip } = getPagination(req.query);

  const [students, total] = await Promise.all([
    StudentProfile.find(filter)
      .populate('user', 'name email isActive')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    StudentProfile.countDocuments(filter),
  ]);

  sendResponse(res, 200, { data: students, meta: buildMeta({ page, limit, total }) });
});

// @route  GET /api/students/:id
// @access Private (admin)
const getStudentById = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id).populate('user', 'name email isActive');
  if (!profile) throw new ApiError(404, 'Student not found');
  sendResponse(res, 200, { data: profile });
});

// @route  PUT /api/students/:id/placement-status
// @access Private (admin) — mark placed/opted-out, e.g. after an offer is accepted
const updatePlacementStatus = asyncHandler(async (req, res) => {
  const { placementStatus, drive, company, ctc } = req.body;

  const profile = await StudentProfile.findById(req.params.id);
  if (!profile) throw new ApiError(404, 'Student not found');

  profile.placementStatus = placementStatus;
  if (placementStatus === 'placed') {
    profile.placedIn = { drive, company, ctc, placedAt: new Date() };
  }
  await profile.save();

  sendResponse(res, 200, { message: 'Placement status updated', data: profile });
});

// @route  POST /api/students/:id/send-noc-reminder
// @access Private (admin) — emails a student who hasn't uploaded their NOC yet
const sendNocReminder = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id).populate('user', 'name email');
  if (!profile) throw new ApiError(404, 'Student not found');
  if (profile.nocUrl) {
    throw new ApiError(400, 'This student has already uploaded their NOC');
  }

  const { sendMail } = require('../utils/mailer');
  const result = await sendMail({
    to: profile.user.email,
    subject: 'Reminder: upload your No-Objection Certificate (NOC)',
    html: `<p>Hi ${profile.user.name.split(' ')[0]},</p><p>Our records show you haven't uploaded your NOC yet. Please log in to NextGen CareerConnect and upload it from your profile page as soon as possible.</p><p>— University Placement Cell</p>`,
  });

  sendResponse(res, 200, {
    message: result.sent
      ? `Reminder emailed to ${profile.user.email}`
      : 'Email not sent — SMTP is not configured on the server. Set SMTP_* env vars to enable this.',
    data: result,
  });
});

// @route  GET /api/students/:id/applications
// @access Private (admin) — a single student's full application history, for their profile page
const getStudentApplications = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id);
  if (!profile) throw new ApiError(404, 'Student not found');

  const Application = require('../models/Application');
  const applications = await Application.find({ student: profile._id })
    .populate('drive', 'title company jobRole ctc status applicationDeadline')
    .sort('-createdAt');

  sendResponse(res, 200, { data: applications });
});

// @route  DELETE /api/students/:id
// @access Private (admin)
const deleteStudent = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id);
  if (!profile) throw new ApiError(404, 'Student not found');

  await User.findByIdAndDelete(profile.user);
  await profile.deleteOne();

  sendResponse(res, 200, { message: 'Student account removed' });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  listStudents,
  getStudentById,
  getStudentApplications,
  updatePlacementStatus,
  sendNocReminder,
  deleteStudent,
};
