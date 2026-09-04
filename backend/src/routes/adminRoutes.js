const express = require('express');
const {
  getDashboardStats,
  getMyProfile,
  updateMyProfile,
  listAdmins,
  createAdmin,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/dashboard', getDashboardStats);
router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.get('/admins', listAdmins);
router.post('/admins', createAdmin);

module.exports = router;
