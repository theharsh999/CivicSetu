import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Send a notification to a specific user
 * @param {string|ObjectId} userId
 * @param {Object} payload { type, title, message, grievanceId, data }
 * @returns {Promise<Object|null>}
 */
export const notify = async (userId, { type = 'system', title, message, grievanceId = null, data = {} }) => {
  if (!userId || !title || !message) return null;

  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title: title.trim(),
      message: message.trim(),
      grievance: grievanceId,
      data,
    });
    return notification;
  } catch (err) {
    console.error(`Failed to send notification to user ${userId}:`, err.message);
    return null;
  }
};

/**
 * Send notifications to multiple users in bulk
 * @param {Array<string|ObjectId>} userIds
 * @param {Object} payload
 */
export const notifyMultiple = async (userIds = [], payload) => {
  if (!userIds || userIds.length === 0 || !payload?.title) return [];

  try {
    const docs = userIds.map((uid) => ({
      user: uid,
      type: payload.type || 'system',
      title: payload.title.trim(),
      message: payload.message.trim(),
      grievance: payload.grievanceId || null,
      data: payload.data || {},
    }));

    return await Notification.insertMany(docs);
  } catch (err) {
    console.error('Failed to send bulk notifications:', err.message);
    return [];
  }
};

/**
 * Send a notification to all active municipal administrators
 * @param {Object} payload
 */
export const notifyAdmins = async (payload) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    const adminIds = admins.map((a) => a._id);
    return await notifyMultiple(adminIds, payload);
  } catch (err) {
    console.error('Failed to notify admins:', err.message);
    return [];
  }
};

/**
 * Helper: Notify citizen of grievance status transition
 */
export const notifyStatusUpdate = async (citizenId, grievance, newStatus, note = '') => {
  if (!citizenId || !grievance) return null;

  const trackingId = grievance.trackingId || 'Your grievance';
  let title = `Ticket ${trackingId}: Status changed to ${newStatus}`;
  let message = note
    ? `Status update: ${newStatus}. Note: ${note}`
    : `Your grievance ticket ${trackingId} is now marked as "${newStatus}".`;

  let type = 'status_update';

  if (newStatus === 'Resolved') {
    type = 'resolution';
    title = `Ticket ${trackingId}: Issue Resolved`;
    message = `Field inspection and repair completed. Please inspect work proof and rate your satisfaction.`;
  } else if (newStatus === 'Closed') {
    title = `Ticket ${trackingId}: Case Closed`;
    message = `Thank you for confirming resolution. Ticket ${trackingId} is now permanently closed.`;
  }

  return notify(citizenId, {
    type,
    title,
    message,
    grievanceId: grievance._id,
    data: { trackingId, status: newStatus },
  });
};

/**
 * Helper: Notify officer of new grievance assignment or reassignment
 */
export const notifyAssignment = async (officerId, grievance, departmentName = '') => {
  if (!officerId || !grievance) return null;

  const trackingId = grievance.trackingId || '';
  return notify(officerId, {
    type: 'assignment',
    title: `New Assignment: ${trackingId} (${grievance.priority} Priority)`,
    message: `A new complaint "${grievance.title}" has been assigned to your queue in ${departmentName || 'your department'}.`,
    grievanceId: grievance._id,
    data: { trackingId, priority: grievance.priority },
  });
};

/**
 * Helper: Notify officer & admins on SLA escalation
 */
export const notifyEscalation = async (grievance, level = 1) => {
  if (!grievance) return;

  const trackingId = grievance.trackingId;
  const payload = {
    type: 'escalation',
    title: `SLA Alert: ${trackingId} Escalated (Tier ${level})`,
    message: `Grievance "${grievance.title}" has exceeded statutory SLA target and is escalated to Tier ${level}.`,
    grievanceId: grievance._id,
    data: { trackingId, escalationLevel: level, priority: grievance.priority },
  };

  // Notify assigned officer if any
  if (grievance.assignedOfficer) {
    const officerId = grievance.assignedOfficer._id || grievance.assignedOfficer;
    await notify(officerId, payload);
  }

  // Notify all administrators
  await notifyAdmins(payload);
};

/**
 * Helper: Notify officer of SLA at-risk warning (>75% window elapsed)
 */
export const notifySlaWarning = async (officerId, grievance, remainingHours = 6) => {
  if (!officerId || !grievance) return null;

  return notify(officerId, {
    type: 'sla_warning',
    title: `SLA Warning: ${grievance.trackingId} Near Deadline`,
    message: `Grievance "${grievance.title}" has less than ${remainingHours} hours remaining before SLA breach.`,
    grievanceId: grievance._id,
    data: { trackingId: grievance.trackingId, remainingHours },
  });
};

/**
 * Helper: Notify citizen when AI classification & routing completes
 */
export const notifyAiRouted = async (citizenId, grievance, departmentName) => {
  if (!citizenId || !grievance) return null;

  return notify(citizenId, {
    type: 'status_update',
    title: `Grievance Routed: ${grievance.trackingId}`,
    message: `Your complaint was classified and routed to ${departmentName || 'Department'} (${grievance.category}) with ${grievance.priority} priority.`,
    grievanceId: grievance._id,
    data: { trackingId: grievance.trackingId, department: departmentName },
  });
};

export default {
  notify,
  notifyMultiple,
  notifyAdmins,
  notifyStatusUpdate,
  notifyAssignment,
  notifyEscalation,
  notifySlaWarning,
  notifyAiRouted,
};
