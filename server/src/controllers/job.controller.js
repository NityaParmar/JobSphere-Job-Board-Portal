const Job = require('../models/Job');
const ApiError = require('../utils/ApiError');

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/**
 * @desc    Search & filter jobs with MongoDB-level queries
 * @route   GET /api/jobs
 * @access  Public
 *
 * Query params:
 *   search     — full-text search on title + location (uses text index)
 *   min_salary — minimum salary filter (salaryMin >= value)
 *   tech_stack — comma-separated tech stack filter (techStack $in)
 *   type       — employment type filter (FULL_TIME, PART_TIME, etc.)
 *   level      — experience level filter (JUNIOR, MID, SENIOR, etc.)
 *   page       — page number (default: 1)
 *   limit      — results per page (default: 10, max: 50)
 */
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      min_salary,
      tech_stack,
      type,
      level,
      page = 1,
      limit = 10,
    } = req.query;

    // Build the filter object — all filtering happens at the MongoDB level
    const filter = { isActive: true };

    // 1. Full-text search using MongoDB text index (title + location)
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // 2. Minimum salary range filter
    if (min_salary) {
      const salary = parseInt(min_salary, 10);
      if (Number.isNaN(salary) || salary < 0) {
        throw ApiError.badRequest('min_salary must be a non-negative number');
      }
      filter.salaryMin = { $gte: salary };
    }

    // 3. Tech stack filter ($in matches jobs containing ANY of the provided techs)
    if (tech_stack && tech_stack.trim()) {
      const techs = tech_stack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (techs.length > 0) {
        filter.techStack = { $in: techs };
      }
    }

    // 4. Employment type filter
    if (type && type.trim()) {
      const validTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];
      if (!validTypes.includes(type.trim())) {
        throw ApiError.badRequest(
          `Invalid employment type. Must be one of: ${validTypes.join(', ')}`
        );
      }
      filter.employmentType = type.trim();
    }

    // 5. Experience level filter
    if (level && level.trim()) {
      const validLevels = ['JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL'];
      if (!validLevels.includes(level.trim())) {
        throw ApiError.badRequest(
          `Invalid experience level. Must be one of: ${validLevels.join(', ')}`
        );
      }
      filter.experienceLevel = level.trim();
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Sorting: relevance score when text searching, newest-first otherwise
    let sortCriteria;
    let projection;

    if (filter.$text) {
      // Include text score for relevance ranking
      projection = { score: { $meta: 'textScore' } };
      sortCriteria = { score: { $meta: 'textScore' } };
    } else {
      projection = {};
      sortCriteria = { createdAt: -1 };
    }

    // Execute query and count in parallel
    const [jobs, total] = await Promise.all([
      Job.find(filter, projection)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .populate('postedBy', 'name email')
        .lean(),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email')
      .lean();

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Employer-only
// ---------------------------------------------------------------------------

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private (EMPLOYER only)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      company,
      location,
      salaryMin,
      salaryMax,
      techStack,
      employmentType,
      experienceLevel,
      applicationDeadline,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salaryMin,
      salaryMax,
      techStack,
      employmentType,
      experienceLevel,
      applicationDeadline: applicationDeadline || null,
      postedBy: req.user._id,
    });

    // Populate the employer info before returning
    await job.populate('postedBy', 'name email');

    res.status(201).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job posting (owner only)
 * @route   PUT /api/jobs/:id
 * @access  Private (EMPLOYER only — must be the poster)
 */
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    // Ownership check: only the employer who posted it can update
    if (job.postedBy.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only update your own job postings');
    }

    // Whitelist of updatable fields
    const allowedFields = [
      'title',
      'description',
      'company',
      'location',
      'salaryMin',
      'salaryMax',
      'techStack',
      'employmentType',
      'experienceLevel',
      'isActive',
      'applicationDeadline',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw ApiError.badRequest('No valid fields provided for update');
    }

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'name email');

    res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job posting (owner only)
 * @route   DELETE /api/jobs/:id
 * @access  Private (EMPLOYER only — must be the poster)
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    // Ownership check
    if (job.postedBy.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only delete your own job postings');
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Employer Dashboard
// ---------------------------------------------------------------------------

/**
 * @desc    Get all jobs posted by the current employer
 * @route   GET /api/jobs/my-posts
 * @access  Private (EMPLOYER only)
 */
const getMyPostedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { jobs, count: jobs.length },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Candidate: Save/Unsave Jobs
// ---------------------------------------------------------------------------

const User = require('../models/User');

/**
 * @desc    Save a job to candidate's savedJobs list
 * @route   POST /api/jobs/:id/save
 * @access  Private (CANDIDATE only)
 */
const saveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    // Use $addToSet to prevent duplicates
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedJobs: jobId } },
      { new: true }
    ).populate({
      path: 'savedJobs',
      select: 'title company location salaryMin salaryMax isActive',
    });

    res.status(200).json({
      success: true,
      message: 'Job saved successfully',
      data: { savedJobs: user.savedJobs },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a job from candidate's savedJobs list
 * @route   DELETE /api/jobs/:id/save
 * @access  Private (CANDIDATE only)
 */
const unsaveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { savedJobs: jobId } },
      { new: true }
    ).populate({
      path: 'savedJobs',
      select: 'title company location salaryMin salaryMax isActive',
    });

    res.status(200).json({
      success: true,
      message: 'Job unsaved successfully',
      data: { savedJobs: user.savedJobs },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyPostedJobs,
  saveJob,
  unsaveJob,
};
