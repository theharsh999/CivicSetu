import express from 'express';
import rateLimit from 'express-rate-limit';
import { analyzeComplaint, getSimilarComplaints } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Light rate limiter for AI preview requests to prevent flood/denial-of-service
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // 120 requests per 15 mins per IP (generous for debounced keystrokes)
  message: {
    success: false,
    message: 'AI request limit reached. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All AI endpoints require authentication
router.use(protect);

router.post('/analyze', aiLimiter, analyzeComplaint);
router.get('/similar', getSimilarComplaints);

export default router;
