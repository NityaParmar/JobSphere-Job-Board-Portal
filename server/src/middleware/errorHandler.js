const ApiError = require('../utils/ApiError');

/**
 * Global error handler middleware.
 * Normalizes Mongoose, JWT, and Multer errors into consistent API responses.
 */
const errorHandler = (err, _req, res, _next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  // -------------------------------------------------------------------------
  // Mongoose: Validation errors (e.g. required fields, enum mismatches)
  // -------------------------------------------------------------------------
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(422, `Validation failed: ${messages.join('. ')}`);
  }

  // -------------------------------------------------------------------------
  // Mongoose: Duplicate key error (e.g. duplicate email)
  // -------------------------------------------------------------------------
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(409, `Duplicate value for '${field}'. This ${field} is already in use.`);
  }

  // -------------------------------------------------------------------------
  // Mongoose: Bad ObjectId cast (e.g. invalid ID in URL params)
  // -------------------------------------------------------------------------
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    error = new ApiError(400, `Invalid ID format: ${err.value}`);
  }

  // -------------------------------------------------------------------------
  // JWT: Invalid or malformed token
  // -------------------------------------------------------------------------
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  // -------------------------------------------------------------------------
  // JWT: Expired token
  // -------------------------------------------------------------------------
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired');
  }

  // -------------------------------------------------------------------------
  // Multer: File size limit exceeded
  // -------------------------------------------------------------------------
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError(413, 'File size exceeds the 5MB limit');
  }

  // -------------------------------------------------------------------------
  // Multer: Unexpected field name
  // -------------------------------------------------------------------------
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new ApiError(400, 'Unexpected file field');
  }

  // Log the full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error Handler]', err.stack || err.message);
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
