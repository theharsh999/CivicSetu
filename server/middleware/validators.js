import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware to evaluate express-validator results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const firstErrorMessage = errorArray[0]?.msg || 'Validation failed';
    throw new ApiError(400, firstErrorMessage, errorArray);
  }
  next();
};

export const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\s-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
];

export const loginValidationRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const profileValidationRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\s-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
];

export const changePasswordValidationRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];
