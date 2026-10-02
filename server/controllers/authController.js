import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/jwt.js';
import { ROLES } from '../utils/constants.js';

/**
 * Format user payload for client responses (strips sensitive fields)
 */
const sanitizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    address: user.address || '',
    ward: user.ward || '',
    department: user.department || null,
    designation: user.designation || '',
    avatar: user.avatar,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
};

/**
 * @desc    Register a new citizen (citizen role is strictly enforced)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, ward } = req.body;

  // Check if email already registered
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email address already exists.');
  }

  // Create new citizen user (Role is strictly forced to citizen)
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: ROLES.CITIZEN,
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    ward: ward ? ward.trim() : '',
  });

  const token = generateToken(user);

  return apiResponse(res, 201, 'Citizen account registered successfully', {
    token,
    user: sanitizeUser(user),
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide both email and password.');
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('+password +isActive')
    .populate('department', 'name code icon color');

  // Generic response to avoid leaking whether email exists
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Check active status
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact municipal support.');
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user);

  return apiResponse(res, 200, 'Signed in successfully', {
    token,
    user: sanitizeUser(user),
  });
});

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private (protect)
 */
export const getMe = asyncHandler(async (req, res) => {
  return apiResponse(res, 200, 'User profile retrieved', {
    user: sanitizeUser(req.user),
  });
});

/**
 * @desc    Update current user profile (name, phone, address, ward)
 * @route   PUT /api/auth/profile
 * @access  Private (protect)
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, ward } = req.body;

  const user = await User.findById(req.user._id).populate('department', 'name code icon color');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (address !== undefined) user.address = address.trim();
  if (ward !== undefined) user.ward = ward.trim();

  await user.save();

  return apiResponse(res, 200, 'Profile updated successfully', {
    user: sanitizeUser(user),
  });
});

/**
 * @desc    Change current user password
 * @route   PUT /api/auth/change-password
 * @access  Private (protect)
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Please provide both current and new passwords.');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters.');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'The current password provided is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  return apiResponse(res, 200, 'Password changed successfully');
});
