import mongoose from 'mongoose';
import Grievance from '../models/Grievance.js';
import Department from '../models/Department.js';
import { generateTrackingId } from '../utils/trackingId.js';
import { routeGrievance, routeGrievanceWithAI } from '../services/routingService.js';
import { analyzeGrievance } from '../services/ai/aiService.js';
import { applyTransition } from '../services/workflowService.js';
import {
  notify,
  notifyAdmins,
  notifyAiRouted,
  notifyAssignment,
} from '../services/notificationService.js';
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

  // 2. Process uploaded evidence attachments (if any)
  const attachments = (req.files || []).map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    uploadedBy: req.user._id,
  }));

  // 3. Initial timeline entry
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

  // 4. ALWAYS run deterministic AI analysis on submit
  const locationPayload = {
    address: address ? address.trim() : (req.user.address || ''),
    ward: ward ? ward.trim() : (req.user.ward || 'Ward 1 - Central'),
    landmark: landmark ? landmark.trim() : '',
    coordinates: {
      lat: parseFloat(lat) || 19.0760,
      lng: parseFloat(lng) || 72.8777,
    },
  };

  const aiResult = await analyzeGrievance({
    title: title.trim(),
    description: description.trim(),
    location: locationPayload,
  });

  // 5. Append AI Classified timeline entry
  const confPercent = Math.round(aiResult.confidence * 100);
  timeline.push({
    status: 'AI Classified',
    title: `AI analysis completed: ${aiResult.department} / ${aiResult.category} / ${aiResult.priority} (${confPercent}%)`,
    note: aiResult.reasoning || `Classified into ${aiResult.category} with ${confPercent}% confidence.`,
    actor: null,
    actorRole: 'system',
    isInternal: false,
    createdAt: new Date(Date.now() + 100),
  });

  // 6. Intelligent routing with governance rules
  const routing = await routeGrievanceWithAI({
    citizenCategory: category,
    citizenDeptCode: req.body.department,
    citizenPriority: priority,
    aiAnalysis: aiResult,
  });

  let assignedDeptId = null;
  let assignedOfficerId = null;
  let status = 'Submitted';

  if (routing.department) {
    assignedDeptId = routing.department._id;
    timeline.push({
      status: 'Submitted',
      title: `Routed to ${routing.department.name}`,
      note: `Complaint classified into category "${routing.category}" (${routing.routingReason}).`,
      actor: null,
      actorRole: 'system',
      isInternal: false,
      createdAt: new Date(Date.now() + 200),
    });
  } else {
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
      createdAt: new Date(Date.now() + 300),
    });
  }

  // 7. Build and save grievance document
  const grievance = await Grievance.create({
    trackingId,
    title: title.trim(),
    description: description.trim(),
    citizen: req.user._id,
    category: routing.category.trim(),
    department: assignedDeptId,
    categorySource: routing.categorySource,
    priority: routing.priority,
    status,
    location: locationPayload,
    attachments,
    assignedOfficer: assignedOfficerId,
    aiAnalysis: {
      department: aiResult.department,
      category: aiResult.category,
      priority: aiResult.priority,
      confidence: aiResult.confidence,
      keywords: aiResult.keywords || [],
      urgencySignals: aiResult.urgencySignals || [],
      summary: aiResult.summary || '',
      reasoning: aiResult.reasoning || '',
      alternatives: aiResult.alternatives || [],
      provider: aiResult.provider || 'rule-based-nlp-v1',
      isMock: aiResult.isMock !== undefined ? aiResult.isMock : true,
      needsManualReview: aiResult.needsManualReview || false,
      analyzedAt: new Date(),
      overridden: false,
    },
    timeline,
    sla: {
      dueAt: routing.dueAt,
      breached: false,
      escalationLevel: 0,
    },
  });

  const populatedGrievance = await Grievance.findById(grievance._id)
    .populate('department', 'name code icon color')
    .populate('assignedOfficer', 'name designation phone ward avatar email')
    .populate('citizen', 'name email phone avatar');

  // Dispatch non-blocking notifications
  try {
    await notifyAiRouted(req.user._id, populatedGrievance, populatedGrievance.department?.name);
    if (assignedOfficerId) {
      await notifyAssignment(assignedOfficerId, populatedGrievance, populatedGrievance.department?.name);
    }
  } catch (notifErr) {
    console.error('Non-blocking notification error on createGrievance:', notifErr.message);
  }

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

  const officerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  const grievanceDeptId = grievance.department?._id?.toString() || grievance.department?.toString();
  const isOfficerInDept = req.user.role === ROLES.OFFICER && (
    !officerDeptId ||
    officerDeptId === grievanceDeptId ||
    grievance.assignedOfficer?._id?.toString() === req.user._id.toString()
  );

  if (!isOwner && !isAdmin && !isOfficerInDept) {
    throw new ApiError(403, 'You are not authorized to access this grievance ticket.');
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

  return apiResponse(res, 200, 'Public grievance status retrieved', {
    grievance: safeData,
  });
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

/**
 * @desc    Submit citizen satisfaction rating and close grievance
 * @route   POST /api/grievances/:id/feedback
 * @access  Private (Owner Citizen only)
 */
export const submitFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    throw new ApiError(400, 'Rating must be an integer between 1 and 5 stars.');
  }

  const grievance = await Grievance.findById(id);
  if (!grievance) {
    throw new ApiError(404, 'Grievance ticket not found');
  }

  // Verify ownership
  if (grievance.citizen.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to submit feedback for this grievance.');
  }

  // Only allowed when status is Resolved
  if (grievance.status !== 'Resolved') {
    throw new ApiError(400, `Feedback can only be submitted for Resolved grievances (current status: ${grievance.status}).`);
  }

  // Store feedback on grievance
  grievance.feedback = {
    rating: Math.round(numRating),
    comment: (comment || '').trim(),
    submittedAt: new Date(),
  };

  // Close grievance via applyTransition
  const transitionNote = (comment || '').trim()
    ? `Citizen submitted ${numRating}★ satisfaction rating: "${comment.trim()}"`
    : `Citizen submitted ${numRating}★ rating and confirmed resolution.`;

  const updatedGrievance = await applyTransition(grievance, 'Closed', req.user, transitionNote);

  // Notify assigned officer
  if (grievance.assignedOfficer) {
    try {
      await notify(grievance.assignedOfficer, {
        type: 'feedback_request',
        title: `Citizen Feedback: ${grievance.trackingId} (${numRating}★)`,
        message: `Citizen rated your resolution ${numRating}/5: "${comment ? comment.trim() : 'Satisfied with resolution'}"`,
        grievanceId: grievance._id,
        data: { trackingId: grievance.trackingId, rating: numRating },
      });
    } catch (notifErr) {
      console.error('Non-blocking feedback notification error:', notifErr.message);
    }
  }

  const populated = await Grievance.findById(updatedGrievance._id)
    .populate('department', 'name code icon color')
    .populate('assignedOfficer', 'name designation phone ward avatar email')
    .populate('citizen', 'name email phone avatar');

  return apiResponse(res, 200, 'Feedback recorded and grievance closed successfully', {
    grievance: populated,
  });
});

/**
 * @desc    Citizen dispute/reopen of resolved grievance (within 7 days)
 * @route   POST /api/grievances/:id/reopen
 * @access  Private (Owner Citizen only)
 */
export const reopenGrievance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    throw new ApiError(400, 'A clear reason is required to dispute resolution and reopen this grievance.');
  }

  const grievance = await Grievance.findById(id);
  if (!grievance) {
    throw new ApiError(404, 'Grievance ticket not found');
  }

  // Verify ownership
  if (grievance.citizen.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to reopen this grievance.');
  }

  // Only allowed when status is Resolved
  if (grievance.status !== 'Resolved') {
    throw new ApiError(400, `Only grievances with status "Resolved" can be reopened (current: ${grievance.status}).`);
  }

  // Check 7-day dispute window
  const resolvedTime = grievance.resolution?.resolvedAt
    ? new Date(grievance.resolution.resolvedAt).getTime()
    : new Date(grievance.updatedAt).getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  if (Date.now() - resolvedTime > sevenDaysMs) {
    throw new ApiError(400, 'The 7-day dispute period has expired. Please file a new grievance ticket if the issue reoccurred.');
  }

  // Transition back to In Progress
  const updatedGrievance = await applyTransition(
    grievance,
    'In Progress',
    req.user,
    `Citizen disputed resolution: ${reason.trim()}`
  );

  // Notify assigned officer and admins
  try {
    if (grievance.assignedOfficer) {
      await notify(grievance.assignedOfficer, {
        type: 'status_update',
        title: `Reopened Ticket: ${grievance.trackingId}`,
        message: `Citizen disputed the resolution. Reason: "${reason.trim()}". Status reverted to In Progress.`,
        grievanceId: grievance._id,
        data: { trackingId: grievance.trackingId, reason: reason.trim() },
      });
    }

    await notifyAdmins({
      type: 'status_update',
      title: `Disputed Grievance Reopened: ${grievance.trackingId}`,
      message: `Citizen rejected resolution for ticket ${grievance.trackingId}. Case reopened with remark: "${reason.trim()}".`,
      grievanceId: grievance._id,
      data: { trackingId: grievance.trackingId, reason: reason.trim() },
    });
  } catch (notifErr) {
    console.error('Non-blocking reopen notification error:', notifErr.message);
  }

  const populated = await Grievance.findById(updatedGrievance._id)
    .populate('department', 'name code icon color')
    .populate('assignedOfficer', 'name designation phone ward avatar email')
    .populate('citizen', 'name email phone avatar');

  return apiResponse(res, 200, 'Grievance reopened and returned to field investigation', {
    grievance: populated,
  });
});
