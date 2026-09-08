const crypto = require('crypto');
const Application = require('../models/Application');
const Job = require('../models/Job');
const ApiError = require('../utils/ApiError');
const { uploadToS3, getPresignedUrl, deleteS3Object } = require('../config/s3');

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
 *   3. Upload resume to S3
 *   4. Save application to MongoDB
 *   5. If MongoDB save fails → rollback: delete the S3 object
 */
const applyToJob = async (req, res, next) => {
  let s3Key = null; // Track for rollback

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

    // 4. Upload resume buffer to S3 (no disk write)
    // Generate a unique key: resumes/<userId>/<timestamp>-<random>.pdf
    const uniqueId = crypto.randomBytes(8).toString('hex');
    s3Key = `resumes/${req.user._id}/${Date.now()}-${uniqueId}.pdf`;

    await uploadToS3(req.file.buffer, s3Key, 'application/pdf');

    // 5. Save application to MongoDB
    let application;
    try {
      application = await Application.create({
        job: jobId,
        candidate: req.user._id,
        resumeS3Key: s3Key,
        coverLetter: coverLetter || '',
      });
    } catch (dbError) {
      // ⚠️ ROLLBACK: MongoDB save failed — delete the already-uploaded S3 object
      console.error(
        `[Rollback] MongoDB save failed. Deleting S3 object: ${s3Key}`
      );
      try {
        await deleteS3Object(s3Key);
        console.log(`[Rollback] S3 object deleted successfully: ${s3Key}`);
      } catch (s3DeleteError) {
        // Log the orphaned S3 object for manual cleanup
        console.error(
          `[Rollback] CRITICAL: Failed to delete orphaned S3 object: ${s3Key}`,
          s3DeleteError.message
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
// Resume Access (Pre-signed URL)
// ---------------------------------------------------------------------------

/**
 * @desc    Get a pre-signed URL to view/download a resume
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

    // Generate pre-signed URL (expires in 15 minutes)
    const presignedUrl = await getPresignedUrl(application.resumeS3Key, 900);

    res.status(200).json({
      success: true,
      data: {
        resumeUrl: presignedUrl,
        expiresIn: '15 minutes',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stream local resume file (used when AWS keys are not configured)
 * @route   GET /api/applications/download-resume/:key
 * @access  Public / Token-safe
 */
const path = require('path');
const fs = require('fs');
const downloadLocalResume = (req, res, next) => {
  try {
    const { key } = req.params;
    const filePath = path.join(__dirname, '../../uploads', key);
    if (!fs.existsSync(filePath)) {
      throw ApiError.notFound('Resume file not found on local storage');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
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
  downloadLocalResume,
};
