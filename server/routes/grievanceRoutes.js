import { Router } from 'express';
import {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  trackPublicGrievance,
  getMyStats,
  submitFeedback,
  reopenGrievance,
} from '../controllers/grievanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadGrievanceImages } from '../middleware/upload.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// Public route for ticket tracking
router.get('/track/:trackingId', trackPublicGrievance);

// Protected routes
router.use(protect);

// Citizen specific routes
router.post(
  '/',
  authorize(ROLES.CITIZEN),
  uploadGrievanceImages.array('images', 4),
  createGrievance
);

router.get('/my', authorize(ROLES.CITIZEN), getMyGrievances);
router.get('/my/stats', authorize(ROLES.CITIZEN), getMyStats);
router.post('/:id/feedback', authorize(ROLES.CITIZEN), submitFeedback);
router.post('/:id/reopen', authorize(ROLES.CITIZEN), reopenGrievance);

// Grievance detail by ID (Protected for owner citizen, officer, or admin)
router.get('/:id', getGrievanceById);

export default router;
