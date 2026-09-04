const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const { sendResponse, ApiError } = require('../utils/apiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');

// @route  GET /api/notifications
// @access Private (any role)
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { recipient: req.user._id };
  if (req.query.unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  sendResponse(res, 200, {
    data: notifications,
    meta: { ...buildMeta({ page, limit, total }), unreadCount },
  });
});

// @route  PUT /api/notifications/:id/read
// @access Private (owner only)
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, 'Notification not found');
  if (String(notification.recipient) !== String(req.user._id)) {
    throw new ApiError(403, 'Not your notification');
  }

  notification.isRead = true;
  await notification.save();

  sendResponse(res, 200, { data: notification });
});

// @route  PUT /api/notifications/read-all
// @access Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  sendResponse(res, 200, { message: 'All notifications marked as read' });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
