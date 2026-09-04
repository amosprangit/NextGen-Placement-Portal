const asyncHandler = require('express-async-handler');
const RecruiterProfile = require('../models/RecruiterProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const { NOTIFICATION_TYPES } = require('../config/constants');

// @route  GET /api/recruiters/me
// @access Private (recruiter)
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, 'Recruiter profile not found');
  sendResponse(res, 200, { data: profile });
});

// @route  PUT /api/recruiters/me
// @access Private (recruiter)
const updateMyProfile = asyncHandler(async (req, res) => {
  const disallowed = ['user', 'isApproved', 'approvedBy', 'approvedAt', 'rejectionReason'];
  const updates = { ...req.body };
  disallowed.forEach((f) => delete updates[f]);

  if (req.file) {
    updates.companyLogoUrl = `/uploads/logos/${req.file.filename}`;
  }

  const profile = await RecruiterProfile.findOneAndUpdate({ user: req.user._id }, updates, {
    new: true,
    runValidators: true,
  });
  if (!profile) throw new ApiError(404, 'Recruiter profile not found');

  sendResponse(res, 200, { message: 'Profile updated', data: profile });
});

// @route  GET /api/recruiters
// @access Private (admin)
const listRecruiters = asyncHandler(async (req, res) => {
  const { isApproved, search } = req.query;
  const filter = {};
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  if (search) filter.companyName = { $regex: search, $options: 'i' };

  const { page, limit, skip } = getPagination(req.query);

  const [recruiters, total] = await Promise.all([
    RecruiterProfile.find(filter)
      .populate('user', 'name email isActive')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    RecruiterProfile.countDocuments(filter),
  ]);

  sendResponse(res, 200, { data: recruiters, meta: buildMeta({ page, limit, total }) });
});

// @route  GET /api/recruiters/:id
// @access Private (admin)
const getRecruiterById = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findById(req.params.id).populate(
    'user',
    'name email isActive'
  );
  if (!profile) throw new ApiError(404, 'Recruiter not found');
  sendResponse(res, 200, { data: profile });
});

// @route  PUT /api/recruiters/:id/approve
// @access Private (admin)
const approveRecruiter = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findById(req.params.id);
  if (!profile) throw new ApiError(404, 'Recruiter not found');

  profile.isApproved = true;
  profile.approvedBy = req.user._id;
  profile.approvedAt = new Date();
  profile.rejectionReason = undefined;
  await profile.save();

  await Notification.create({
    recipient: profile.user,
    type: NOTIFICATION_TYPES.RECRUITER_APPROVED,
    title: 'Recruiter account approved',
    message: `${profile.companyName} has been approved. You can now log in and post drives.`,
  });

  sendResponse(res, 200, { message: 'Recruiter approved', data: profile });
});

// @route  PUT /api/recruiters/:id/reject
// @access Private (admin)
const rejectRecruiter = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const profile = await RecruiterProfile.findById(req.params.id);
  if (!profile) throw new ApiError(404, 'Recruiter not found');

  profile.isApproved = false;
  profile.rejectionReason = reason || 'Not approved by placement cell';
  await profile.save();

  await Notification.create({
    recipient: profile.user,
    type: NOTIFICATION_TYPES.RECRUITER_REJECTED,
    title: 'Recruiter account not approved',
    message: profile.rejectionReason,
  });

  sendResponse(res, 200, { message: 'Recruiter rejected', data: profile });
});

// @route  DELETE /api/recruiters/:id
// @access Private (admin)
const deleteRecruiter = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findById(req.params.id);
  if (!profile) throw new ApiError(404, 'Recruiter not found');

  await User.findByIdAndDelete(profile.user);
  await profile.deleteOne();

  sendResponse(res, 200, { message: 'Recruiter account removed' });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  listRecruiters,
  getRecruiterById,
  approveRecruiter,
  rejectRecruiter,
  deleteRecruiter,
};
