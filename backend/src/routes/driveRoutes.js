const express = require('express');
const {
  createDrive,
  listDrives,
  getDriveById,
  updateDrive,
  updateDriveStatus,
  getDriveAnalytics,
  deleteDrive,
} = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDriveValidator } = require('../validators/driveValidators');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect); // every role needs to be logged in to see drives

router.post('/', authorize(ROLES.RECRUITER, ROLES.ADMIN), createDriveValidator, validate, createDrive);
router.get('/', listDrives); // all three roles, filtered per-role inside the controller
router.get('/:id', getDriveById);
router.get('/:id/analytics', authorize(ROLES.RECRUITER, ROLES.ADMIN), getDriveAnalytics);
router.put('/:id', authorize(ROLES.RECRUITER, ROLES.ADMIN), updateDrive);
router.patch('/:id/status', authorize(ROLES.RECRUITER, ROLES.ADMIN), updateDriveStatus);
router.delete('/:id', authorize(ROLES.RECRUITER, ROLES.ADMIN), deleteDrive);

module.exports = router;
