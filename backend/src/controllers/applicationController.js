const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Drive = require('../models/Drive');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const { ROLES, DRIVE_STATUS, APPLICATION_STATUS, NOTIFICATION_TYPES } = require('../config/constants');
const { isStudentEligible } = require('./driveController');

// @route  POST /api/applications/:driveId
// @access Private (student)
const applyToDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.driveId);
  if (!drive) throw new ApiError(404, 'Drive not found');

  if (drive.status !== DRIVE_STATUS.OPEN) {
    throw new ApiError(400, 'This drive is not currently accepting applications');
  }
  if (drive.applicationDeadline < new Date()) {
    throw new ApiError(400, 'The application deadline for this drive has passed');
  }

  const studentProfile = await StudentProfile.findOne({ user: req.user._id });
  if (!studentProfile) throw new ApiError(404, 'Student profile not found');

  if (!studentProfile.resumeUrl && !req.file) {
    throw new ApiError(400, 'Upload your resume before applying to a drive');
  }
  if (!isStudentEligible(drive, studentProfile)) {
    throw new ApiError(403, 'You do not meet the eligibility criteria for this drive');
  }

  const existing = await Application.findOne({ student: studentProfile._id, drive: drive._id });
  if (existing) throw new ApiError(409, 'You have already applied to this drive');

  // A student can optionally upload a drive-tailored resume at the moment
  // of applying; otherwise we snapshot whatever's on their profile.
  const resumeUrlSnapshot = req.file
    ? `/uploads/resumes/${req.file.filename}`
    : studentProfile.resumeUrl;

  const application = await Application.create({
    student: studentProfile._id,
    drive: drive._id,
    resumeUrlSnapshot,
    coverNote: req.body.coverNote,
    history: [{ status: APPLICATION_STATUS.APPLIED, changedBy: req.user._id }],
  });

  drive.applicationsCount += 1;
  await drive.save();

  sendResponse(res, 201, { message: 'Application submitted', data: application });
});

// @route  GET /api/applications/me
// @access Private (student)
const getMyApplications = asyncHandler(async (req, res) => {
  const studentProfile = await StudentProfile.findOne({ user: req.user._id });
  if (!studentProfile) throw new ApiError(404, 'Student profile not found');

  const { page, limit, skip } = getPagination(req.query);
  const filter = { student: studentProfile._id };
  if (req.query.status) filter.status = req.query.status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('drive', 'title company jobRole ctc status applicationDeadline')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  sendResponse(res, 200, { data: applications, meta: buildMeta({ page, limit, total }) });
});

// @route  DELETE /api/applications/:id  (withdraw)
// @access Private (student, owner only, and only while still "applied")
const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found');

  const studentProfile = await StudentProfile.findOne({ user: req.user._id });
  if (!studentProfile || String(application.student) !== String(studentProfile._id)) {
    throw new ApiError(403, 'You do not have permission to withdraw this application');
  }
  if (application.status !== APPLICATION_STATUS.APPLIED) {
    throw new ApiError(400, 'Only applications still at the "applied" stage can be withdrawn');
  }

  application.status = APPLICATION_STATUS.WITHDRAWN;
  application.history.push({ status: APPLICATION_STATUS.WITHDRAWN, changedBy: req.user._id });
  await application.save();

  sendResponse(res, 200, { message: 'Application withdrawn', data: application });
});

// @route  GET /api/applications/drive/:driveId
// @access Private (owning recruiter or admin) — the applicant list for a drive
const getApplicationsForDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.driveId);
  if (!drive) throw new ApiError(404, 'Drive not found');

  if (req.user.role === ROLES.RECRUITER && String(drive.createdBy) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not have permission to view applicants for this drive');
  }

  const { page, limit, skip } = getPagination(req.query);
  const filter = { drive: drive._id };
  if (req.query.status) filter.status = req.query.status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate({
        path: 'student',
        select: 'rollNumber branch batch cgpa resumeUrl skills phone',
        populate: { path: 'user', select: 'name email' },
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  sendResponse(res, 200, { data: applications, meta: buildMeta({ page, limit, total }) });
});

// @route  PUT /api/applications/:id/status
// @access Private (owning recruiter or admin) — shortlist / schedule / select / reject
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, remarks, currentRoundIndex } = req.body;
  if (!Object.values(APPLICATION_STATUS).includes(status)) {
    throw new ApiError(400, 'Invalid application status');
  }

  const application = await Application.findById(req.params.id).populate('drive');
  if (!application) throw new ApiError(404, 'Application not found');

  if (
    req.user.role === ROLES.RECRUITER &&
    String(application.drive.createdBy) !== String(req.user._id)
  ) {
    throw new ApiError(403, 'You do not have permission to update this application');
  }

  const previousStatus = application.status;
  application.status = status;
  if (typeof currentRoundIndex === 'number') application.currentRoundIndex = currentRoundIndex;
  application.history.push({ status, remarks, changedBy: req.user._id });
  await application.save();

  if (previousStatus !== APPLICATION_STATUS.SELECTED && status === APPLICATION_STATUS.SELECTED) {
    application.drive.selectedCount += 1;
    await application.drive.save();
  }

  const studentProfile = await StudentProfile.findById(application.student);
  if (studentProfile) {
    await Notification.create({
      recipient: studentProfile.user,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS,
      title: `Application update — ${application.drive.title}`,
      message: `Your application status changed to "${status.replace('_', ' ')}".${
        remarks ? ` Note: ${remarks}` : ''
      }`,
    });
  }

  sendResponse(res, 200, { message: 'Application status updated', data: application });
});

// @route  PUT /api/applications/:id/meta
// @access Private (owning recruiter or admin) — mark attendance & interview status
const updateApplicationMeta = asyncHandler(async (req, res) => {
  const { attendance, interviewGiven } = req.body;

  const application = await Application.findById(req.params.id).populate('drive');
  if (!application) throw new ApiError(404, 'Application not found');

  if (
    req.user.role === ROLES.RECRUITER &&
    String(application.drive.createdBy) !== String(req.user._id)
  ) {
    throw new ApiError(403, 'You do not have permission to update this application');
  }

  if (attendance !== undefined) {
    if (!['not_marked', 'present', 'absent'].includes(attendance)) {
      throw new ApiError(400, 'Invalid attendance value');
    }
    application.attendance = attendance;
  }
  if (interviewGiven !== undefined) {
    application.interviewGiven = Boolean(interviewGiven);
  }
  await application.save();

  sendResponse(res, 200, { message: 'Application updated', data: application });
});

const assertDriveAccess = (drive, user) => {
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.RECRUITER && String(drive.createdBy) === String(user._id)) return;
  throw new ApiError(403, 'You do not have permission to access applicants for this drive');
};

const fetchDriveApplicantsForExport = async (driveId) => {
  const drive = await Drive.findById(driveId);
  if (!drive) throw new ApiError(404, 'Drive not found');

  const applications = await Application.find({ drive: driveId })
    .populate({
      path: 'student',
      select: 'rollNumber branch batch cgpa backlogs resumeUrl phone',
      populate: { path: 'user', select: 'name email' },
    })
    .sort('-createdAt');

  return { drive, applications };
};

// @route  GET /api/applications/drive/:driveId/export
// @access Private (owning recruiter or admin) — downloads the applicant list as .xlsx
const exportApplicantsExcel = asyncHandler(async (req, res) => {
  const { drive, applications } = await fetchDriveApplicantsForExport(req.params.driveId);
  assertDriveAccess(drive, req.user);

  const { buildApplicantsWorkbook } = require('../utils/excelExport');
  const { buffer, filename } = await buildApplicantsWorkbook(drive, applications);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

// @route  POST /api/applications/drive/:driveId/export-email
// @access Private (admin) — emails the applicant list as an .xlsx attachment
const emailApplicantsExport = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Recipient email is required');

  const { drive, applications } = await fetchDriveApplicantsForExport(req.params.driveId);
  assertDriveAccess(drive, req.user);

  const { buildApplicantsWorkbook } = require('../utils/excelExport');
  const { buffer, filename } = await buildApplicantsWorkbook(drive, applications);

  const { sendMail } = require('../utils/mailer');
  const result = await sendMail({
    to: email,
    subject: `Applicant list — ${drive.company} (${drive.title})`,
    html: `<p>Attached is the applicant list for <strong>${drive.title}</strong> at <strong>${drive.company}</strong> (${applications.length} applicants).</p><p>— NextGen CareerConnect Placement Cell</p>`,
    attachments: [
      {
        filename,
        content: buffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  });

  sendResponse(res, 200, {
    message: result.sent
      ? `Applicant list emailed to ${email}`
      : `Email not sent — SMTP is not configured on the server. Set SMTP_* env vars to enable this.`,
    data: result,
  });
});

module.exports = {
  applyToDrive,
  getMyApplications,
  withdrawApplication,
  getApplicationsForDrive,
  updateApplicationStatus,
  updateApplicationMeta,
  exportApplicantsExcel,
  emailApplicantsExport,
};
