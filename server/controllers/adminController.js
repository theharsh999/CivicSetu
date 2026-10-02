import crypto from 'crypto';
import Grievance from '../models/Grievance.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { getAdminOverviewStats, getAdminAnalyticsData } from '../services/analyticsService.js';
import { applyTransition } from '../services/workflowService.js';
import { findLeastLoadedOfficer } from '../services/routingService.js';
import { runEscalationCheck } from '../jobs/escalationJob.js';
import { notifyAssignment } from '../services/notificationService.js';
import { apiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PRIORITIES, SLA_HOURS, ROLES } from '../utils/constants.js';

const OPEN_STATUSES = ['Submitted', 'AI Classified', 'Assigned', 'In Progress', 'Awaiting Verification', 'Escalated'];

/**
 * @desc    Get executive KPIs and dashboard overview metrics
 * @route   GET /api/admin/overview
 * @access  Private (Admin)
 */
export const getOverview = asyncHandler(async (req, res) => {
  const overview = await getAdminOverviewStats();
  return apiResponse(res, 200, 'Executive overview retrieved successfully', overview);
});

/**
 * @desc    Get multi-dimensional analytics with date range
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;
  const analytics = await getAdminAnalyticsData(range);
  return apiResponse(res, 200, `Analytics for range '${range}' retrieved successfully`, analytics);
});

/**
 * @desc    Get all grievances with global search, filters, and pagination
 * @route   GET /api/admin/grievances
 * @access  Private (Admin)
 */
export const getAllGrievances = asyncHandler(async (req, res) => {
  const {
    search,
    department,
    status,
    priority,
    ward,
    escalated,
    overdue,
    dateRange,
    sort = 'newest',
    page = 1,
    limit = 10,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  // Search filter across Tracking ID, Title, Description
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { trackingId: { $regex: s, $options: 'i' } },
      { title: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
    ];
  }

  // Department filter
  if (department && department !== 'all') {
    query.department = department;
  }

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Priority filter
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  // Ward filter
  if (ward && ward !== 'all') {
    query['location.ward'] = ward;
  }

  // Escalated filter
  if (escalated === 'true') {
    query.$or = [{ status: 'Escalated' }, { 'sla.escalationLevel': { $gt: 0 } }];
  }

  // Overdue filter
  if (overdue === 'true') {
    const now = new Date();
    query.status = { $in: OPEN_STATUSES };
    query.$or = [{ 'sla.breached': true }, { 'sla.dueAt': { $lt: now } }];
  }

  // Date range filter (7d, 30d, 90d)
  if (dateRange && dateRange !== 'all') {
    const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
    query.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
  }

  // Sorting
  let sortQuery = { createdAt: -1 };
  if (sort === 'oldest') {
    sortQuery = { createdAt: 1 };
  } else if (sort === 'priority') {
    sortQuery = { priority: 1, createdAt: -1 };
  } else if (sort === 'sla') {
    sortQuery = { 'sla.dueAt': 1 };
  }

  const [total, grievances] = await Promise.all([
    Grievance.countDocuments(query),
    Grievance.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .populate('department', 'name code color icon')
      .populate('citizen', 'name email phone avatar')
      .populate('assignedOfficer', 'name designation phone email avatar'),
  ]);

  return apiResponse(res, 200, 'Grievances retrieved successfully', {
    grievances,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

/**
 * @desc    Get lightweight geospatial coordinates for GIS map view
 * @route   GET /api/admin/grievances/map
 * @access  Private (Admin)
 */
export const getGrievancesMap = asyncHandler(async (req, res) => {
  const { department, status, priority, ward } = req.query;

  const query = {};

  if (department && department !== 'all') query.department = department;
  if (status && status !== 'all') query.status = status;
  if (priority && priority !== 'all') query.priority = priority;
  if (ward && ward !== 'all') query['location.ward'] = ward;

  const points = await Grievance.find(query)
    .populate('department', 'name code color icon')
    .select('trackingId title status priority category department location createdAt')
    .limit(200);

  return apiResponse(res, 200, 'Map coordinates retrieved successfully', {
    count: points.length,
    points,
  });
});

/**
 * @desc    Reassign grievance to any department and optionally a specific officer
 * @route   PATCH /api/admin/grievances/:id/reassign
 * @access  Private (Admin)
 */
export const reassignGrievance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { departmentId, officerId, reason } = req.body;

  if (!reason || !reason.trim()) {
    throw new ApiError(400, 'A reason is mandatory for administrative reassignments.');
  }

  const grievance = await Grievance.findById(id);
  if (!grievance) {
    throw new ApiError(404, 'Grievance not found');
  }

  const targetDept = await Department.findById(departmentId);
  if (!targetDept) {
    throw new ApiError(400, 'Target department does not exist');
  }

  let targetOfficer = null;
  if (officerId) {
    targetOfficer = await User.findOne({
      _id: officerId,
      department: targetDept._id,
      isActive: true,
    });
    if (!targetOfficer) {
      throw new ApiError(400, 'Selected officer is not an active staff member of the target department');
    }
  } else {
    targetOfficer = await findLeastLoadedOfficer(targetDept._id);
  }

  const prevDeptId = grievance.department?.toString();
  const isDeptChange = prevDeptId !== targetDept._id.toString();

  grievance.department = targetDept._id;
  grievance.assignedOfficer = targetOfficer ? targetOfficer._id : null;
  grievance.status = 'Assigned';

  const noteText = `${reason.trim()} (Transferred to ${targetDept.name} • Assigned: ${
    targetOfficer ? targetOfficer.name : 'Pending Officer Queue'
  })`;

  grievance.timeline.push({
    status: 'Assigned',
    title: isDeptChange ? 'Reassigned & Transferred by Administrator' : 'Officer Reassigned by Administrator',
    note: noteText,
    actor: req.user._id,
    actorRole: 'admin',
    isInternal: false,
    createdAt: new Date(),
  });

  await grievance.save();

  if (targetOfficer) {
    try {
      await notifyAssignment(targetOfficer._id, grievance, targetDept.name);
    } catch (nErr) {
      console.error('Notification error on reassignment:', nErr.message);
    }
  }

  const populated = await Grievance.findById(id)
    .populate('department', 'name code color icon')
    .populate('citizen', 'name email phone avatar')
    .populate('assignedOfficer', 'name designation phone email avatar')
    .populate('timeline.actor', 'name role designation');

  return apiResponse(res, 200, 'Grievance reassigned successfully', {
    grievance: populated,
  });
});

/**
 * @desc    Override status of a grievance
 * @route   PATCH /api/admin/grievances/:id/status
 * @access  Private (Admin)
 */
export const updateGrievanceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!status) {
    throw new ApiError(400, 'Target status is required');
  }

  const grievance = await Grievance.findById(id);
  if (!grievance) {
    throw new ApiError(404, 'Grievance not found');
  }

  let updatedGrievance;
  try {
    // Attempt standard workflow transition
    updatedGrievance = await applyTransition(grievance, status, req.user, note);
  } catch (err) {
    // Admin emergency override if transition machine blocks it
    grievance.status = status;
    grievance.timeline.push({
      status,
      title: `Administrative Override to ${status}`,
      note: note ? `${note.trim()} (Manual executive override)` : 'Manual executive override by Municipal Commissioner',
      actor: req.user._id,
      actorRole: 'admin',
      isInternal: false,
      createdAt: new Date(),
    });
    updatedGrievance = await grievance.save();
  }

  const populated = await Grievance.findById(id)
    .populate('department', 'name code color icon')
    .populate('citizen', 'name email phone avatar')
    .populate('assignedOfficer', 'name designation phone email avatar')
    .populate('timeline.actor', 'name role designation');

  return apiResponse(res, 200, `Grievance status updated to '${status}'`, {
    grievance: populated,
  });
});

/**
 * @desc    Override priority of a grievance
 * @route   PATCH /api/admin/grievances/:id/priority
 * @access  Private (Admin)
 */
export const updateGrievancePriority = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { priority, note } = req.body;

  if (![PRIORITIES.LOW, PRIORITIES.MEDIUM, PRIORITIES.HIGH, PRIORITIES.CRITICAL].includes(priority)) {
    throw new ApiError(400, 'Invalid priority level');
  }

  const grievance = await Grievance.findById(id);
  if (!grievance) {
    throw new ApiError(404, 'Grievance not found');
  }

  const prevPriority = grievance.priority;
  grievance.priority = priority;

  // Recompute SLA target
  const hours = SLA_HOURS[priority] || 96;
  grievance.sla = grievance.sla || {};
  grievance.sla.dueAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  grievance.timeline.push({
    status: grievance.status,
    title: `Priority Adjusted (${prevPriority} → ${priority})`,
    note: note ? note.trim() : `Executive recalibration of urgency and resolution target to ${priority} (${hours}h SLA).`,
    actor: req.user._id,
    actorRole: 'admin',
    isInternal: false,
    createdAt: new Date(),
  });

  await grievance.save();

  const populated = await Grievance.findById(id)
    .populate('department', 'name code color icon')
    .populate('citizen', 'name email phone avatar')
    .populate('assignedOfficer', 'name designation phone email avatar')
    .populate('timeline.actor', 'name role designation');

  return apiResponse(res, 200, `Priority updated to '${priority}'`, {
    grievance: populated,
  });
});

/**
 * @desc    Get all departments with officer counts and open ticket volume
 * @route   GET /api/admin/departments
 * @access  Private (Admin)
 */
export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find()
    .populate('head', 'name email phone designation avatar')
    .sort({ name: 1 });

  const enriched = await Promise.all(
    departments.map(async (d) => {
      const [totalGrievances, openGrievances, officerCount] = await Promise.all([
        Grievance.countDocuments({ department: d._id }),
        Grievance.countDocuments({ department: d._id, status: { $in: OPEN_STATUSES } }),
        User.countDocuments({ department: d._id, role: ROLES.OFFICER, isActive: true }),
      ]);

      return {
        ...d.toObject(),
        totalGrievances,
        openGrievances,
        officerCount,
      };
    })
  );

  return apiResponse(res, 200, 'Departments retrieved successfully', {
    departments: enriched,
  });
});

/**
 * @desc    Create new municipal department
 * @route   POST /api/admin/departments
 * @access  Private (Admin)
 */
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, color, icon, head } = req.body;

  if (!name || !code) {
    throw new ApiError(400, 'Department name and unique code are required.');
  }

  const existing = await Department.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    throw new ApiError(400, `Department with code '${code.toUpperCase()}' already exists.`);
  }

  const department = await Department.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    description: description ? description.trim() : '',
    color: color || '#0284c7',
    icon: icon || 'Building',
    head: head || null,
    isActive: true,
  });

  return apiResponse(res, 201, 'Department created successfully', {
    department,
  });
});

/**
 * @desc    Update department or toggle active status
 * @route   PUT /api/admin/departments/:id
 * @access  Private (Admin)
 */
export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, color, icon, isActive, head } = req.body;

  const department = await Department.findById(id);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  // Deactivation safety check: Cannot deactivate if open grievances exist
  if (isActive === false && department.isActive === true) {
    const openCount = await Grievance.countDocuments({
      department: id,
      status: { $in: OPEN_STATUSES },
    });

    if (openCount > 0) {
      throw new ApiError(
        400,
        `Cannot deactivate department "${department.name}" because it currently has ${openCount} open grievance(s). Please reassign them to another department first.`
      );
    }
  }

  if (name !== undefined) department.name = name.trim();
  if (description !== undefined) department.description = description.trim();
  if (color !== undefined) department.color = color;
  if (icon !== undefined) department.icon = icon;
  if (isActive !== undefined) department.isActive = Boolean(isActive);
  if (head !== undefined) department.head = head || null;

  await department.save();

  const updated = await Department.findById(id).populate('head', 'name email designation');

  return apiResponse(res, 200, 'Department updated successfully', {
    department: updated,
  });
});

/**
 * @desc    Get user directory with search, role filters, and pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { search, role, department, page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { ward: { $regex: s, $options: 'i' } },
      { designation: { $regex: s, $options: 'i' } },
    ];
  }

  if (role && role !== 'all') {
    query.role = role;
  }

  if (department && department !== 'all') {
    query.department = department;
  }

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('department', 'name code color icon'),
  ]);

  return apiResponse(res, 200, 'Users retrieved successfully', {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

/**
 * @desc    Create new officer or admin account with generated temporary password
 * @route   POST /api/admin/users
 * @access  Private (Admin)
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role = ROLES.OFFICER, department, designation, phone, ward } = req.body;

  if (!name || !email) {
    throw new ApiError(400, 'Name and email are required');
  }

  if (role === ROLES.OFFICER && !department) {
    throw new ApiError(400, 'Department assignment is required for municipal officers');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(400, 'A user account with this email address already exists');
  }

  // Generate secure random temporary password shown once
  const randomChars = crypto.randomBytes(3).toString('hex');
  const tempPassword = `Civic@${randomChars}2026`;

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: tempPassword,
    role,
    department: role === ROLES.OFFICER ? department : null,
    designation: designation ? designation.trim() : (role === ROLES.OFFICER ? 'Field Officer' : 'Administrator'),
    phone: phone ? phone.trim() : '',
    ward: ward ? ward.trim() : 'Ward 1 - Central',
    isActive: true,
  });

  const populated = await User.findById(user._id).populate('department', 'name code color icon');

  return apiResponse(res, 201, 'User account created successfully', {
    user: populated,
    tempPassword, // Displayed once in admin modal
  });
});

/**
 * @desc    Update user details or toggle active status
 * @route   PATCH /api/admin/users/:id
 * @access  Private (Admin)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, ward, designation, department, isActive } = req.body;

  // Prevent admin from deactivating themselves
  if (req.user._id.toString() === id && isActive === false) {
    throw new ApiError(400, 'Self-deactivation forbidden: You cannot deactivate your own administrator account.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name !== undefined) user.name = name.trim();
  if (email !== undefined) user.email = email.toLowerCase().trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (ward !== undefined) user.ward = ward.trim();
  if (designation !== undefined) user.designation = designation.trim();
  if (department !== undefined) user.department = department || null;
  if (isActive !== undefined) user.isActive = Boolean(isActive);

  await user.save();

  const populated = await User.findById(id).populate('department', 'name code color icon');

  return apiResponse(res, 200, 'User updated successfully', {
    user: populated,
  });
});

/**
 * @desc    Trigger manual SLA escalation check sweep
 * @route   POST /api/admin/sla/run-check
 * @access  Private (Admin)
 */
export const runSlaCheck = asyncHandler(async (req, res) => {
  const summary = await runEscalationCheck();
  return apiResponse(res, 200, 'SLA escalation check completed successfully', summary);
});

/**
 * @desc    Demo tool: Simulate SLA breach by shifting dueAt into the past and running check
 * @route   POST /api/admin/sla/simulate-breach
 * @access  Private (Admin)
 */
export const simulateSlaBreach = asyncHandler(async (req, res) => {
  const { grievanceId } = req.body;

  let grievance;
  if (grievanceId) {
    grievance = await Grievance.findById(grievanceId);
  } else {
    // Pick an active grievance that isn't yet Escalated or Closed
    grievance = await Grievance.findOne({
      status: { $in: ['Assigned', 'In Progress', 'Submitted'] },
    }).sort({ createdAt: -1 });
  }

  if (!grievance) {
    throw new ApiError(404, 'No active candidate grievance available to simulate breach.');
  }

  // Shift SLA dueAt 4 hours into the past
  grievance.sla = grievance.sla || {};
  grievance.sla.dueAt = new Date(Date.now() - 4 * 60 * 60 * 1000);
  grievance.sla.warnedAtRisk = true;
  await grievance.save();

  // Run escalation check immediately
  const checkSummary = await runEscalationCheck();

  const updatedGrievance = await Grievance.findById(grievance._id)
    .populate('department', 'name code color icon')
    .populate('assignedOfficer', 'name designation phone email avatar');

  return apiResponse(res, 200, `SLA breach simulated for ticket ${grievance.trackingId}`, {
    grievance: updatedGrievance,
    checkSummary,
  });
});

export default {
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
  runSlaCheck,
  simulateSlaBreach,
};
