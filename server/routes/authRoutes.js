import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validate,
  registerValidationRules,
  loginValidationRules,
  profileValidationRules,
  changePasswordValidationRules,
} from '../middleware/validators.js';

const router = Router();

// Rate limiter for authentication attempts (prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.',
  },
});

// Public routes
router.post('/register', authLimiter, registerValidationRules, validate, register);
router.post('/login', authLimiter, loginValidationRules, validate, login);

// Protected routes (Require active session)
router.get('/me', protect, getMe);
router.put('/profile', protect, profileValidationRules, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidationRules, validate, changePassword);

export default router;
