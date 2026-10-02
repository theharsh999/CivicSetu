import mongoose from 'mongoose';
import Grievance from '../models/Grievance.js';
import Department from '../models/Department.js';
import { generateTrackingId } from '../utils/trackingId.js';
import { routeGrievance } from '../services/routingService.js';
import { apiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PRIORITIES, SLA_HOURS, ROLES } from '../utils/constants.js';

/**
 * @desc    Lodge a new citizen grievance
 * @route   POST /api/grievances
 * @access  Private (Citizen only)
 */
export const createGrievance = asyncHandler(async (req, res) => {
  const { title, description, category, priority = 'Medium', address, ward, landmark, lat, lng } = req.body;

  if (!title || !description || !category) {
    throw new ApiError(400, 'Title, description, and category are required.');
  }

  // 1. Generate unique Tracking ID (GRV-YYYY-NNNNNN)
  const trackingId = await generateTrackingId();

  // 2. Compute SLA due date
  const validPriority = [PRIORITIES.LOW, PRIORITIES.MEDIUM, PRIORITIES.HIGH, PRIORITIES.CRITICAL].includes(priority)
    ? priority
    : PRIORITIES.MEDIUM;

  const hoursToResolve = SLA_HOURS[validPriority] || 96;
  const dueAt = new Date(Date.now() + hoursToResolve * 60 * 60 * 1000);

  // 3. Process uploaded evidence attachments (if any)
  const attachments = (req.files || []).map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    uploadedBy: req.user._id,
  }));

  // 4. Initial timeline entry
  const timeline = [
    {
      status: 'Submitted',
      title: 'Grievance submitted',
      note: 'Complaint lodged by citizen through CivicSetu portal.',
      actor: req.user._id,
      actorRole: 'citizen',
      isInternal: false,
      createdAt: new Date(),
    },
  ];

  // 5. Rule-based department & officer routing
  const routing = await routeGrievance(category, req.body.department);

  let assignedDeptId = null;
  let assignedOfficerId = null;
  let status = 'Submitted';

  if (routing.department) {
    assignedDeptId = routing.department._id;
    timeline.push({
      status: 'Submitted',
      title: `Routed to ${routing.department.name}`,
      note: `Complaint classified into category "${category}" and assigned to municipal department.`,
      actor: null,
      actorRole: 'system',
      isInternal: false,
      createdAt: new Date(Date.now() + 100),
    });
  } else {
    // Fallback to OTHER department
    const fallbackDept = await Department.findOne({ code: 'OTHER' });
    if (fallbackDept) assignedDeptId = fallbackDept._id;
  }

  if (routing.assignedOfficer) {
    assignedOfficerId = routing.assignedOfficer._id;
    status = 'Assigned';
    timeline.push({
      status: 'Assigned',
      title: `Assigned to ${routing.assignedOfficer.name}`,
      note: `Dispatched to ${routing.assignedOfficer.designation || 'Field Officer'} for verification and redressal.`,
      actor: routing.assignedOfficer._id,
      actorRole: 'system',
      isInternal: false,
      createdAt: new Date(Date.now() + 200),
    });
  }

  // 6. Build and save grievance document
  const grievance = await Grievance.create({
    trackingId,
    title: title.trim(),
    description: description.trim(),
    citizen: req.user._id,
    category: category.trim(),
    department: assignedDeptId,
    categorySource: 'citizen',
    priority: validPriority,
    status,
    location: {
      address: address ? address.trim() : (req.user.address || ''),
      ward: ward ? ward.trim() : (req.user.ward || 'Ward 1 - Central'),
      landmark: landmark ? landmark.trim() : '',
      coordinates: {
        lat: parseFloat(lat) || 19.0760,
        lng: parseFloat(lng) || 72.8777,
      },
    },
    attachments,
    assignedOfficer: assignedOfficerId,
    timeline,
    sla: {
      dueAt,
      breached: false,
      escalationLevel: 0,
    },
  });

  const populatedGrievance = await Grievance.findById(grievance._id)
    .populate('department', 'name code icon color')
    .populate('assignedOfficer', 'name designation phone ward avatar email')
    .populate('citizen', 'name email phone avatar');

  return apiResponse(res, 201, 'Grievance lodged successfully', {
    grievance: populatedGrievance,
  });
});

/**
 * @desc    Get all grievances logged by current citizen
 * @route   GET /api/grievances/my
 * @access  Private (Citizen)
 */
export const getMyGrievances = asyncHandler(async (req, res) => {
  const { status, department, priority, search, sort = 'newest', page = 1, limit = 10 } = req.query;

  const query = { citizen: req.user._id };

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Department filter
  if (department && department !== 'all') {
    if (mongoose.Types.ObjectId.isValid(department)) {
      query.department = department;
    } else {
      const deptDoc = await Department.findOne({ code: department.toUpperCase() });
      if (deptDoc) query.department = deptDoc._id;
    }
  }

  // Priority filter
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  // Text / ID Search
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { trackingId: { $regex: s, $options: 'i' } },
      { title: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
    ];
  }

  // Sort configuration
  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (sort === 'priority') {
    sortOption = { priority: 1, createdAt: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [grievances, total] = await Promise.all([
    Grievance.find(query)
      .populate('department', 'name code icon color')
      .populate('assignedOfficer', 'name designation email avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Grievance.countDocuments(query),
  ]);

  // Strip internal timeline and remarks for citizen view
  const sanitized = grievances.map((g) => ({
    ...g,
    timeline: (g.timeline || []).filter((t) => !t.isInternal),
    remarks: (g.remarks || []).filter((r) => !r.isInternal),
  }));

  return apiResponse(res, 200, 'Grievances retrieved', {
    grievances: sanitized,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

/**
 * @desc    Get detailed single grievance by ID or Tracking ID
 * @route   GET /api/grievances/:id
 * @access  Private (Owner citizen, Officer in department, or Admin)
 */
export const getGrievanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let query = {};
  if (mongoose.Types.ObjectId.isValid(id)) {
    query._id = id;
  } else {
    query.trackingId = id.toUpperCase();
  }

  const grievance = await Grievance.findOne(query)
    .populate('department', 'name code icon color')
    .populate('assignedOfficer', 'name designation phone ward avatar email')
    .populate('citizen', 'name email phone avatar address ward')
    .populate('timeline.actor', 'name role designation avatar')
    .populate('remarks.author', 'name role designation avatar');

  if (!grievance) {
    throw new ApiError(404, 'Grievance ticket not found.');
  }

  // Authorization check
  const isOwner = req.user.role === ROLES.CITIZEN && grievance.citizen?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;
  const isOfficer = req.user.role === ROLES.OFFICER;

  if (!isOwner && !isAdmin && !isOfficer) {
    throw new ApiError(403, 'You are not authorized to view this grievance.');
  }

  // Hide internal entries for citizen
  const result = grievance.toObject();
  if (req.user.role === ROLES.CITIZEN) {
    result.timeline = (result.timeline || []).filter((t) => !t.isInternal);
    result.remarks = (result.remarks || []).filter((r) => !r.isInternal);
  }

  return apiResponse(res, 200, 'Grievance details retrieved', {
    grievance: result,
  });
});

/**
 * @desc    Public tracking lookup without authentication
 * @route   GET /api/grievances/track/:trackingId
 * @access  Public
 */
export const trackPublicGrievance = asyncHandler(async (req, res) => {
  const { trackingId } = req.params;

  if (!trackingId || !trackingId.trim()) {
    throw new ApiError(400, 'Tracking ID is required.');
  }

  const grievance = await Grievance.findOne({
    trackingId: trackingId.trim().toUpperCase(),
  })
    .populate('department', 'name code icon color')
    .select(
      'trackingId title category priority status location.ward location.address sla createdAt timeline'
    );

  if (!grievance) {
    throw new ApiError(404, `No grievance found with reference ID "${trackingId.toUpperCase()}".`);
  }

  // Filter public safe fields only
  const safeData = {
    trackingId: grievance.trackingId,
    title: grievance.title,
    category: grievance.category,
    department: grievance.department?.name || 'Municipal Services',
    departmentCode: grievance.department?.code || 'OTHER',
    departmentColor: grievance.department?.color || '#0284c7',
    status: grievance.status,
    priority: grievance.priority,
    location: {
      ward: grievance.location?.ward || '',
      address: grievance.location?.address || '',
    },
    sla: {
      dueAt: grievance.sla?.dueAt,
      breached: grievance.sla?.breached || false,
    },
    createdAt: grievance.createdAt,
    timeline: (grievance.timeline || [])
      .filter((t) => !t.isInternal)
      .map((t) => ({
        status: t.status,
        title: t.title,
        note: t.note,
        actorRole: t.actorRole,
        createdAt: t.createdAt,
      })),
  };

  return apiResponse(res, 200, 'Public grievance status retrieved', safeData);
});

/**
 * @desc    Get citizen grievance aggregate metrics
 * @route   GET /api/grievances/my/stats
 * @access  Private (Citizen)
 */
export const getMyStats = asyncHandler(async (req, res) => {
  const citizenId = req.user._id;

  const [total, inProgress, resolved, pending, escalated] = await Promise.all([
    Grievance.countDocuments({ citizen: citizenId }),
    Grievance.countDocuments({
      citizen: citizenId,
      status: { $in: ['In Progress', 'Assigned', 'AI Classified'] },
    }),
    Grievance.countDocuments({
      citizen: citizenId,
      status: { $in: ['Resolved', 'Closed'] },
    }),
    Grievance.countDocuments({
      citizen: citizenId,
      status: { $in: ['Submitted', 'Awaiting Verification'] },
    }),
    Grievance.countDocuments({
      citizen: citizenId,
      $or: [{ status: 'Escalated' }, { 'sla.breached': true }],
    }),
  ]);

  return apiResponse(res, 200, 'Citizen statistics retrieved', {
    total,
    inProgress,
    resolved,
    pending,
    escalated,
  });
});
