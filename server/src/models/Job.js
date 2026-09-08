const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    salaryMin: {
      type: Number,
      required: [true, 'Minimum salary is required'],
      min: [0, 'Salary cannot be negative'],
      validate: {
        validator: Number.isFinite,
        message: 'Minimum salary must be a valid number',
      },
    },
    salaryMax: {
      type: Number,
      required: [true, 'Maximum salary is required'],
      min: [0, 'Salary cannot be negative'],
      validate: {
        validator: Number.isFinite,
        message: 'Maximum salary must be a valid number',
      },
    },
    techStack: {
      type: [String],
      required: [true, 'At least one tech stack item is required'],
      validate: {
        validator: (arr) => arr.length > 0 && arr.length <= 30,
        message: 'Tech stack must have between 1 and 30 items',
      },
    },
    employmentType: {
      type: String,
      enum: {
        values: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'],
        message:
          'Employment type must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE',
      },
      required: [true, 'Employment type is required'],
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL'],
        message:
          'Experience level must be one of: JUNIOR, MID, SENIOR, LEAD, PRINCIPAL',
      },
      required: [true, 'Experience level is required'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must have a poster (employer)'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicationDeadline: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // Allow null (no deadline) or a future date
          if (value === null) return true;
          return value > new Date();
        },
        message: 'Application deadline must be a future date',
      },
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
// Pre-validate hook: cross-field salary check (works for save())
// ---------------------------------------------------------------------------
jobSchema.pre('validate', function (next) {
  if (this.salaryMax != null && this.salaryMin != null && this.salaryMax < this.salaryMin) {
    this.invalidate('salaryMax', 'Maximum salary must be >= minimum salary');
  }
  next();
});

// Pre-findOneAndUpdate hook: cross-field salary check (works for updates)
jobSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  // Only validate if salary fields are being updated
  if (update.salaryMin !== undefined || update.salaryMax !== undefined) {
    // Get the current document to compare against
    const doc = await this.model.findOne(this.getQuery()).lean();
    if (doc) {
      const newMin = update.salaryMin !== undefined ? update.salaryMin : doc.salaryMin;
      const newMax = update.salaryMax !== undefined ? update.salaryMax : doc.salaryMax;
      if (newMax < newMin) {
        throw new mongoose.Error.ValidationError(null).addError(
          'salaryMax',
          new mongoose.Error.ValidatorError({
            message: 'Maximum salary must be >= minimum salary',
            path: 'salaryMax',
            value: newMax,
          })
        );
      }
    }
  }
  next();
});

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Text index for $text / $search queries on title and location
// Weights: title matches are 3× more relevant than location matches
jobSchema.index(
  { title: 'text', location: 'text' },
  {
    weights: { title: 3, location: 1 },
    name: 'idx_text_title_location',
  }
);

// Standard indexes for range and set filtering
jobSchema.index({ salaryMin: 1 }, { name: 'idx_salaryMin' });
jobSchema.index({ techStack: 1 }, { name: 'idx_techStack' });

// Active jobs sorted by creation date (common listing query)
jobSchema.index(
  { isActive: 1, createdAt: -1 },
  { name: 'idx_active_created' }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
