const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const AdminProfile = require('../models/AdminProfile');
const User = require('../models/User');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const { DRIVE_STATUS, PLACEMENT_STATUS, ROLES } = require('../config/constants');

// @route  GET /api/admin/dashboard
// @access Private (admin) — the numbers behind the placement-cell dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    placedStudents,
    totalRecruiters,
    pendingRecruiters,
    approvedRecruiters,
    totalDrives,
    openDrives,
    totalApplications,
    selectedApplications,
    branchWiseBreakdown,
  ] = await Promise.all([
    StudentProfile.countDocuments(),
    StudentProfile.countDocuments({ placementStatus: PLACEMENT_STATUS.PLACED }),
    RecruiterProfile.countDocuments(),
    RecruiterProfile.countDocuments({ isApproved: false }),
    RecruiterProfile.countDocuments({ isApproved: true }),
    Drive.countDocuments(),
    Drive.countDocuments({ status: DRIVE_STATUS.OPEN }),
    Application.countDocuments(),
    Application.countDocuments({ status: 'selected' }),
    StudentProfile.aggregate([
      {
        $group: {
          _id: '$branch',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$placementStatus', PLACEMENT_STATUS.PLACED] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  sendResponse(res, 200, {
    data: {
      students: {
        total: totalStudents,
        placed: placedStudents,
        placementRate: totalStudents ? Math.round((placedStudents / totalStudents) * 100) : 0,
      },
      recruiters: {
        total: totalRecruiters,
        pending: pendingRecruiters,
        approved: approvedRecruiters,
      },
      drives: {
        total: totalDrives,
        open: openDrives,
      },
      applications: {
        total: totalApplications,
        selected: selectedApplications,
      },
      branchWiseBreakdown,
    },
  });
});

// @route  GET /api/admin/me
// @access Private (admin)
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await AdminProfile.findOne({ user: req.user._id });
  sendResponse(res, 200, { data: { user: req.user, profile } });
});

// @route  PUT /api/admin/me
// @access Private (admin)
const updateMyProfile = asyncHandler(async (req, res) => {
  const { phone, designation, department } = req.body;
  const profile = await AdminProfile.findOneAndUpdate(
    { user: req.user._id },
    { phone, designation, department },
    { new: true, upsert: true, runValidators: true }
  );
  sendResponse(res, 200, { message: 'Profile updated', data: profile });
});

// @route  GET /api/admin/admins
// @access Private (admin) — see who else has placement-cell access
const listAdmins = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { role: ROLES.ADMIN };

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  const profiles = await AdminProfile.find({ user: { $in: users.map((u) => u._id) } });
  const profileByUser = new Map(profiles.map((p) => [String(p.user), p]));
  const data = users.map((u) => ({ user: u, profile: profileByUser.get(String(u._id)) || null }));

  sendResponse(res, 200, { data, meta: buildMeta({ page, limit, total }) });
});

// @route  POST /api/admin/admins
// @access Private (admin) — the only way a new placement-cell account gets
// created after the initial `npm run seed` — deliberately requires an
// existing admin to be logged in, so the role can never be self-assigned.
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, designation, department, phone } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ name, email, password, role: ROLES.ADMIN });
  const profile = await AdminProfile.create({
    user: user._id,
    designation,
    department,
    phone,
    createdBy: req.user._id,
  });

  sendResponse(res, 201, { message: 'Admin account created', data: { user, profile } });
});

module.exports = { getDashboardStats, getMyProfile, updateMyProfile, listAdmins, createAdmin };
