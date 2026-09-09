const mongoose = require('mongoose');

const APPLICATION_STATUSES = ['PENDING', 'INTERVIEW', 'REJECTED', 'ACCEPTED'];

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must reference a job'],
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must reference a candidate'],
      index: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required to apply'],
    },
    coverLetter: {
      type: String,
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: `Status must be one of: ${APPLICATION_STATUSES.join(', ')}`,
      },
      default: 'PENDING',
    },
    employerNotes: {
      type: String,
      maxlength: [2000, 'Employer notes cannot exceed 2000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Compound unique index — a candidate can apply to a job exactly once
applicationSchema.index(
  { job: 1, candidate: 1 },
  { unique: true, name: 'idx_unique_application' }
);

// Employer queries: list all applications for a specific job, filtered by status
applicationSchema.index(
  { job: 1, status: 1 },
  { name: 'idx_job_status' }
);

// Candidate queries: view own application history
applicationSchema.index(
  { candidate: 1, createdAt: -1 },
  { name: 'idx_candidate_history' }
);

// ---------------------------------------------------------------------------
// Statics
// ---------------------------------------------------------------------------
applicationSchema.statics.APPLICATION_STATUSES = APPLICATION_STATUSES;

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
