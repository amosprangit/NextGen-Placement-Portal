const express = require('express');
const {
  applyToDrive,
  getMyApplications,
  withdrawApplication,
  getApplicationsForDrive,
  updateApplicationStatus,
  updateApplicationMeta,
  exportApplicantsExcel,
  emailApplicantsExport,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

// Student self-service
router.post('/:driveId', authorize(ROLES.STUDENT), uploadResume.single('resume'), applyToDrive);
router.get('/me', authorize(ROLES.STUDENT), getMyApplications);
router.delete('/:id', authorize(ROLES.STUDENT), withdrawApplication);

// Recruiter / admin review
router.get('/drive/:driveId', authorize(ROLES.RECRUITER, ROLES.ADMIN), getApplicationsForDrive);
router.get('/drive/:driveId/export', authorize(ROLES.RECRUITER, ROLES.ADMIN), exportApplicantsExcel);
router.post('/drive/:driveId/export-email', authorize(ROLES.ADMIN), emailApplicantsExport);
router.put('/:id/status', authorize(ROLES.RECRUITER, ROLES.ADMIN), updateApplicationStatus);
router.put('/:id/meta', authorize(ROLES.RECRUITER, ROLES.ADMIN), updateApplicationMeta);

module.exports = router;
