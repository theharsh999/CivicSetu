import { ApiError } from '../utils/ApiError.js';
import { ALLOWED_TRANSITIONS } from '../utils/constants.js';
import {
  notifyStatusUpdate,
  notifyAssignment,
  notifyEscalation,
} from './notificationService.js';

/**
 * Validates and executes a lifecycle status transition on a grievance.
 * Enforces state machine rules and actor authorization, appends an audit timeline entry,
 * and maintains consistent status across the platform.
 *
 * @param {Object} grievance - Mongoose Grievance document
 * @param {string} toStatus - Target status to transition to
 * @param {Object} actor - Authenticated User document (req.user)
 * @param {string} [note=''] - Optional note or explanation for the transition
 * @param {Object} [extraData={}] - Optional metadata (e.g. resolution summary, proofImages)
 * @returns {Promise<Object>} The updated and saved grievance document
 */
export const applyTransition = async (grievance, toStatus, actor, note = '', extraData = {}) => {
  if (!grievance) {
    throw ApiError.notFound('Grievance not found');
  }

  const currentStatus = grievance.status;
  const validNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];

  // 1. Validate State Machine Transition
  if (!validNextStatuses.includes(toStatus)) {
    throw ApiError.badRequest(
      `Invalid transition: Cannot move from "${currentStatus}" to "${toStatus}". Allowed transitions: ${
        validNextStatuses.length ? validNextStatuses.join(', ') : 'None (Terminal state)'
      }`
    );
  }

  // 2. Validate Actor Permissions
  if (actor.role === 'citizen') {
    const citizenId = grievance.citizen?._id
      ? grievance.citizen._id.toString()
      : grievance.citizen?.toString();
    if (citizenId !== actor._id.toString()) {
      throw ApiError.forbidden('You are not authorized to modify another citizen\'s grievance');
    }
    // Citizen can only close or reopen a resolved grievance
    if (!['Closed', 'In Progress'].includes(toStatus)) {
      throw ApiError.forbidden('Citizens are only permitted to accept resolution or reopen grievances');
    }
  } else if (actor.role === 'officer') {
    const grievanceDeptId = grievance.department?._id
      ? grievance.department._id.toString()
      : grievance.department?.toString();
    const officerDeptId = actor.department?._id
      ? actor.department._id.toString()
      : actor.department?.toString();

    if (!officerDeptId || officerDeptId !== grievanceDeptId) {
      throw ApiError.forbidden('Officers can only modify grievances assigned to their own municipal department');
    }
  } else if (actor.role !== 'admin') {
    throw ApiError.forbidden('Role is not authorized to perform workflow status transitions');
  }

  // 3. Determine Contextual Timeline Title
  let timelineTitle = `Status updated to ${toStatus}`;
  if (toStatus === 'In Progress' && currentStatus === 'Resolved') {
    timelineTitle = 'Grievance Reopened by Citizen';
  } else if (toStatus === 'In Progress') {
    timelineTitle = 'Field Investigation Initiated';
  } else if (toStatus === 'Awaiting Verification') {
    timelineTitle = 'Field Resolution Submitted for Verification';
  } else if (toStatus === 'Resolved') {
    timelineTitle = 'Grievance Marked as Resolved';
  } else if (toStatus === 'Closed') {
    timelineTitle = 'Grievance Officially Closed';
  } else if (toStatus === 'Escalated') {
    timelineTitle = 'Grievance Escalated (SLA Alert)';
  } else if (toStatus === 'Assigned') {
    timelineTitle = 'Routed to Ward Nodal Officer';
  }

  // 4. Update Status and Domain Fields
  grievance.status = toStatus;

  if (toStatus === 'Resolved') {
    grievance.resolution = {
      summary: extraData.summary || note || 'Resolved by department field squad',
      proofImages: extraData.proofImages || [],
      resolvedBy: actor._id,
      resolvedAt: new Date(),
    };
  }

  if (toStatus === 'Escalated') {
    grievance.sla = grievance.sla || {};
    grievance.sla.breached = true;
    grievance.sla.escalationLevel = (grievance.sla.escalationLevel || 0) + 1;
    grievance.sla.escalatedAt = new Date();
  }

  // 5. Append Timeline Entry
  grievance.timeline.push({
    status: toStatus,
    title: timelineTitle,
    note: (note || '').trim(),
    actor: actor._id,
    actorRole: actor.role,
    isInternal: Boolean(extraData.isInternal),
    createdAt: new Date(),
  });

  await grievance.save();

  // 6. Centralized Notifications Dispatch
  try {
    const citizenId = grievance.citizen?._id || grievance.citizen;
    const officerId = grievance.assignedOfficer?._id || grievance.assignedOfficer;

    // Notify citizen on key lifecycle steps
    if (citizenId && ['In Progress', 'Awaiting Verification', 'Resolved', 'Closed'].includes(toStatus)) {
      notifyStatusUpdate(citizenId, grievance, toStatus, note);
    }

    // Notify officer when assigned
    if (toStatus === 'Assigned' && officerId) {
      notifyAssignment(officerId, grievance, grievance.department?.name || '');
    }

    // Notify officer & admins on SLA escalation
    if (toStatus === 'Escalated') {
      notifyEscalation(grievance, grievance.sla?.escalationLevel || 1);
    }
  } catch (notifErr) {
    console.error('Non-blocking notification error in applyTransition:', notifErr.message);
  }

  return grievance;
};

export default {
  ALLOWED_TRANSITIONS,
  applyTransition,
};
