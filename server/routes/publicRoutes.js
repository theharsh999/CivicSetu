import { Router } from 'express';
import { getPublicStats } from '../controllers/publicController.js';

const router = Router();

// Public statistics for landing page
router.get('/stats', getPublicStats);

export default router;
