import express from 'express';
import {
  getOverview,
  getAnalytics,
  getAllGrievances,
  getGrievancesMap,
  reassignGrievance,
  updateGrievanceStatus,
  updateGrievancePriority,
  getDepartments,
  createDepartment,
  updateDepartment,
  getUsers,
  createUser,
  updateUser,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// Enforce authentication & Admin role across all /api/admin endpoints
router.use(protect);
router.use(authorize(ROLES.ADMIN));

// Overview & Analytics
router.get('/overview', getOverview);
router.get('/analytics', getAnalytics);

// Grievance Management & Geospatial Map
router.get('/grievances', getAllGrievances);
router.get('/grievances/map', getGrievancesMap);
router.patch('/grievances/:id/reassign', reassignGrievance);
router.patch('/grievances/:id/status', updateGrievanceStatus);
router.patch('/grievances/:id/priority', updateGrievancePriority);

// Department Directory & Config
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);

// User & Officer Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);

export default router;
