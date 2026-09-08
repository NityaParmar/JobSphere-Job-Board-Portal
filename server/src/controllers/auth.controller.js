const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a signed JWT for the given user.
 * Payload contains user id and role for RBAC checks.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Build a standardized auth response with user data + token.
 */
const sendAuthResponse = (res, statusCode, user, token) => {
  res.status(statusCode).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        createdAt: user.createdAt,
      },
      token,
    },
  });
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, bio, skills } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !role) {
      throw ApiError.badRequest('Name, email, password, and role are required');
    }

    // 2. Validate role value
    if (!['EMPLOYER', 'CANDIDATE'].includes(role)) {
      throw ApiError.badRequest('Role must be either EMPLOYER or CANDIDATE');
    }

    // 3. Validate password strength
    if (password.length < 8) {
      throw ApiError.badRequest('Password must be at least 8 characters');
    }

    // 4. Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // 5. Create user (password is hashed via pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone: phone || null,
      bio: bio || '',
      skills: skills || [],
    });

    // 6. Generate token and respond
    const token = generateToken(user);
    sendAuthResponse(res, 201, user, token);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    // 2. Find user and explicitly select the password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      // Generic message to prevent user enumeration
      throw ApiError.unauthorized('Invalid email or password');
    }

    // 3. Compare passwords
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // 4. Generate token and respond
    const token = generateToken(user);
    sendAuthResponse(res, 200, user, token);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (requires valid JWT)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      select: 'title company location salaryMin salaryMax isActive',
      match: { isActive: true }, // Only return active saved jobs
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    // Only allow specific fields to be updated (whitelist approach)
    const allowedFields = ['name', 'phone', 'bio', 'skills'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw ApiError.badRequest('No valid fields provided for update');
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,             // Return the updated document
      runValidators: true,   // Run schema validators on update
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
