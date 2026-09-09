const crypto = require('crypto');
const Application = require('../models/Application');
const Job = require('../models/Job');
const ApiError = require('../utils/ApiError');
const { uploadToStorage, getSignedUrl, deleteStorageObject } = require('../config/storage');

// ---------------------------------------------------------------------------
// Candidate
// ---------------------------------------------------------------------------

/**
 * @desc    Apply to a job with resume upload
 * @route   POST /api/applications
 * @access  Private (CANDIDATE only)
 *
 * Flow:
 *   1. Validate job exists and is active
 *   2. Check for duplicate application
 *   3. Upload resume to Supabase Storage
 *   4. Save application to MongoDB
 *   5. If MongoDB save fails → rollback: delete the Supabase object
 */
const applyToJob = async (req, res, next) => {
  let storagePath = null; // Track for rollback

  try {
    const { jobId, coverLetter } = req.body;

    // 1. Validate required fields
    if (!jobId) {
      throw ApiError.badRequest('jobId is required');
    }

    if (!req.file) {
      throw ApiError.badRequest('Resume file (PDF) is required');
    }

    // 2. Verify job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      throw ApiError.notFound('Job not found');
    }
    if (!job.isActive) {
      throw ApiError.badRequest('This job posting is no longer active');
    }

    // Check application deadline
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      throw ApiError.badRequest('The application deadline for this job has passed');
    }

    // 3. Check for duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApplication) {
      throw ApiError.conflict('You have already applied to this job');
    }

    // 4. Upload resume buffer to Supabase Storage (no disk write)
    // Generate a unique path: resumes/<timestamp>-<userId>.pdf
    storagePath = `resumes/${Date.now()}-${req.user._id}.pdf`;

    await uploadToStorage(req.file.buffer, storagePath, 'application/pdf');

    // 5. Save application to MongoDB
    let application;
    try {
      application = await Application.create({
        job: jobId,
        candidate: req.user._id,
        resumeUrl: storagePath,
        coverLetter: coverLetter || '',
      });
    } catch (dbError) {
      // ⚠️ ROLLBACK: MongoDB save failed — delete the already-uploaded storage object
      console.error(
        `[Rollback] MongoDB save failed. Deleting storage object: ${storagePath}`
      );
      try {
        await deleteStorageObject(storagePath);
        console.log(`[Rollback] Storage object deleted successfully: ${storagePath}`);
      } catch (storageDeleteError) {
        // Log the orphaned storage object for manual cleanup
        console.error(
          `[Rollback] CRITICAL: Failed to delete orphaned storage object: ${storagePath}`,
          storageDeleteError.message
        );
      }
      throw dbError; // Re-throw the original DB error
    }

    // Populate job and candidate info before returning
    await application.populate([
      { path: 'job', select: 'title company location' },
      { path: 'candidate', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current candidate's application history
 * @route   GET /api/applications/my
 * @access  Private (CANDIDATE only)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        select: 'title company location salaryMin salaryMax employmentType isActive',
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { applications, count: applications.length },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Employer
// ---------------------------------------------------------------------------

/**
 * @desc    Get all applicants for a specific job posting
 * @route   GET /api/applications/job/:jobId
 * @access  Private (EMPLOYER only — must own the job)
 */
const getApplicantsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Verify job exists and employer owns it
    const job = await Job.findById(jobId);
    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only view applicants for your own job postings');
    }

    // Optional status filter
    const filter = { job: jobId };
    if (req.query.status) {
      const validStatuses = Application.APPLICATION_STATUSES;
      if (!validStatuses.includes(req.query.status)) {
        throw ApiError.badRequest(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'candidate',
        select: 'name email phone skills bio',
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        job: { _id: job._id, title: job.title, company: job.company },
        applications,
        count: applications.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status (Employer toggles: PENDING → INTERVIEW → ACCEPTED/REJECTED)
 * @route   PATCH /api/applications/:id/status
 * @access  Private (EMPLOYER only — must own the associated job)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, employerNotes } = req.body;

    if (!status) {
      throw ApiError.badRequest('Status is required');
    }

    const validStatuses = Application.APPLICATION_STATUSES;
    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    // Find the application and populate the job to check ownership
    const application = await Application.findById(req.params.id).populate(
      'job',
      'postedBy title company'
    );

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    // Verify employer owns the associated job
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden(
        'You can only update applications for your own job postings'
      );
    }

    // Update status and optional notes
    application.status = status;
    if (employerNotes !== undefined) {
      application.employerNotes = employerNotes;
    }

    await application.save();

    // Re-populate for response
    await application.populate('candidate', 'name email');

    res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Resume Access (Signed URL)
// ---------------------------------------------------------------------------

/**
 * @desc    Get a signed URL to view/download a resume
 * @route   GET /api/applications/:id/resume
 * @access  Private (CANDIDATE who applied OR EMPLOYER who owns the job)
 */
const getResumeUrl = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate(
      'job',
      'postedBy'
    );

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    // Authorization: candidate who owns the application OR employer who owns the job
    const isCandidateOwner =
      application.candidate.toString() === req.user._id.toString();
    const isJobEmployer =
      application.job.postedBy.toString() === req.user._id.toString();

    if (!isCandidateOwner && !isJobEmployer) {
      throw ApiError.forbidden('You are not authorized to view this resume');
    }

    // Generate signed URL (expires in 15 minutes)
    const fileKey = application.resumeUrl || application.resumeS3Key;
    const signedUrl = await getSignedUrl(fileKey, 60 * 15);

    res.status(200).json({
      success: true,
      data: {
        resumeUrl: signedUrl,
        expiresIn: '15 minutes',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  getResumeUrl,
};
