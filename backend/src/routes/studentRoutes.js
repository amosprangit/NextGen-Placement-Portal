const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  listStudents,
  getStudentById,
  getStudentApplications,
  updatePlacementStatus,
  sendNocReminder,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadStudentDocs } = require('../middleware/upload');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

// Self-service (student only)
router.get('/me', authorize(ROLES.STUDENT), getMyProfile);
router.put(
  '/me',
  authorize(ROLES.STUDENT),
  uploadStudentDocs.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'noc', maxCount: 1 },
  ]),
  updateMyProfile
);

// Placement-cell management (admin only)
router.get('/', authorize(ROLES.ADMIN), listStudents);
router.get('/:id', authorize(ROLES.ADMIN), getStudentById);
router.get('/:id/applications', authorize(ROLES.ADMIN), getStudentApplications);
router.put('/:id/placement-status', authorize(ROLES.ADMIN), updatePlacementStatus);
router.post('/:id/send-noc-reminder', authorize(ROLES.ADMIN), sendNocReminder);
router.delete('/:id', authorize(ROLES.ADMIN), deleteStudent);

module.exports = router;
