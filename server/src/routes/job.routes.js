const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyPostedJobs,
  saveJob,
  unsaveJob,
} = require('../controllers/job.controller');

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------
router.get('/', getJobs);
router.get('/search', getJobs); // Alias for clarity — same handler

// ---------------------------------------------------------------------------
// Employer-only routes (must come before /:id to avoid param collision)
// ---------------------------------------------------------------------------
router.get('/my-posts', protect, authorize('EMPLOYER'), getMyPostedJobs);
router.post('/', protect, authorize('EMPLOYER'), createJob);

// ---------------------------------------------------------------------------
// Parameterized routes
// ---------------------------------------------------------------------------
router.get('/:id', getJobById);
router.put('/:id', protect, authorize('EMPLOYER'), updateJob);
router.delete('/:id', protect, authorize('EMPLOYER'), deleteJob);

// ---------------------------------------------------------------------------
// Candidate: save/unsave a job
// ---------------------------------------------------------------------------
router.post('/:id/save', protect, authorize('CANDIDATE'), saveJob);
router.delete('/:id/save', protect, authorize('CANDIDATE'), unsaveJob);

module.exports = router;
