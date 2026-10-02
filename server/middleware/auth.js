import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

/**
 * Protect middleware: Verifies JWT token and attaches user to request
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please sign in to continue.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'civicsetu_super_secret_jwt_key_2026_dev');

    const user = await User.findById(decoded.id)
      .populate('department', 'name code icon color')
      .select('+isActive');

    if (!user) {
      throw new ApiError(401, 'User account associated with this token no longer exists.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Please contact municipal support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please sign in again.');
    }
    throw new ApiError(401, 'Invalid authentication token.');
  }
});

/**
 * Authorize middleware: Restricts route to specific user roles
 * @param  {...string} roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: '${req.user.role}' role is not authorized to access this resource`
        )
      );
    }

    next();
  };
};
