const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  listRecruiters,
  getRecruiterById,
  approveRecruiter,
  rejectRecruiter,
  deleteRecruiter,
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/auth');
const { uploadLogo } = require('../middleware/upload');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

// Self-service (recruiter only)
router.get('/me', authorize(ROLES.RECRUITER), getMyProfile);
router.put('/me', authorize(ROLES.RECRUITER), uploadLogo.single('logo'), updateMyProfile);

// Placement-cell management (admin only)
router.get('/', authorize(ROLES.ADMIN), listRecruiters);
router.get('/:id', authorize(ROLES.ADMIN), getRecruiterById);
router.put('/:id/approve', authorize(ROLES.ADMIN), approveRecruiter);
router.put('/:id/reject', authorize(ROLES.ADMIN), rejectRecruiter);
router.delete('/:id', authorize(ROLES.ADMIN), deleteRecruiter);

module.exports = router;
