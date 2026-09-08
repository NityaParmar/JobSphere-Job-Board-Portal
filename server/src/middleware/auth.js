const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Protect middleware — verifies JWT from Authorization header.
 * Attaches the authenticated user to `req.user`.
 *
 * Expected header format: `Authorization: Bearer <token>`
 */
const protect = async (req, _res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
      throw ApiError.unauthorized('No authentication token provided');
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check that user still exists (account could have been deleted after token was issued)
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized(
        'The user belonging to this token no longer exists'
      );
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize middleware — restricts access to specific roles.
 * Must be used AFTER `protect` middleware.
 *
 * @param  {...string} roles - Allowed roles (e.g. 'EMPLOYER', 'CANDIDATE')
 * @returns Express middleware
 *
 * @example
 *   router.post('/jobs', protect, authorize('EMPLOYER'), createJob);
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        ApiError.unauthorized('Authentication required before authorization')
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
