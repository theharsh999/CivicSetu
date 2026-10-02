import { Router } from 'express';
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

// Public routes
router.post('/register', registerValidationRules, validate, register);
router.post('/login', loginValidationRules, validate, login);

// Protected routes (Require active session)
router.get('/me', protect, getMe);
router.put('/profile', protect, profileValidationRules, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidationRules, validate, changePassword);

export default router;
