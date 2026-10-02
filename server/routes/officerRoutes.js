import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getOfficerGrievances,
  getOfficerStats,
  updateGrievanceStatus,
  addOfficerRemark,
  reassignOfficer,
  correctGrievanceCategory,
  resolveGrievance,
  getDepartmentOfficers,
} from '../controllers/officerController.js';

const router = express.Router();

// All officer routes require authentication and officer or admin role
router.use(protect);
router.use(authorize('officer', 'admin'));

router.get('/grievances', getOfficerGrievances);
router.get('/stats', getOfficerStats);
router.get('/department-officers', getDepartmentOfficers);

router.patch('/grievances/:id/status', updateGrievanceStatus);
router.post('/grievances/:id/remarks', addOfficerRemark);
router.patch('/grievances/:id/assign', reassignOfficer);
router.patch('/grievances/:id/category', correctGrievanceCategory);
router.post('/grievances/:id/resolve', upload.array('proofImages', 3), resolveGrievance);

export default router;
