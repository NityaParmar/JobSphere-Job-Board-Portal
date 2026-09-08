const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  getResumeUrl,
} = require('../controllers/application.controller');

// ---------------------------------------------------------------------------
// Candidate routes
// ---------------------------------------------------------------------------

// Apply to a job — multipart/form-data with resume PDF
router.post(
  '/',
  protect,
  authorize('CANDIDATE'),
  upload.single('resume'),
  applyToJob
);

// Get my application history
router.get('/my', protect, authorize('CANDIDATE'), getMyApplications);

// ---------------------------------------------------------------------------
// Employer routes
// ---------------------------------------------------------------------------

// Get all applicants for a specific job
router.get(
  '/job/:jobId',
  protect,
  authorize('EMPLOYER'),
  getApplicantsForJob
);

// Update application status (PENDING → INTERVIEW → ACCEPTED/REJECTED)
router.patch(
  '/:id/status',
  protect,
  authorize('EMPLOYER'),
  updateApplicationStatus
);

// ---------------------------------------------------------------------------
// Shared route (both candidate and employer can access)
// ---------------------------------------------------------------------------

// Get pre-signed URL for resume viewing
router.get('/:id/resume', protect, getResumeUrl);

module.exports = router;
