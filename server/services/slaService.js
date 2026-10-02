import { SLA_HOURS, PRIORITIES } from '../utils/constants.js';
import { applyTransition } from './workflowService.js';
import { notifyEscalation, notifySlaWarning, notifyAdmins } from './notificationService.js';

const NEXT_PRIORITY = {
  [PRIORITIES.LOW]: PRIORITIES.MEDIUM,
  [PRIORITIES.MEDIUM]: PRIORITIES.HIGH,
  [PRIORITIES.HIGH]: PRIORITIES.CRITICAL,
  [PRIORITIES.CRITICAL]: PRIORITIES.CRITICAL,
};

/**
 * Calculates current SLA health metrics for a grievance
 * @param {Object} grievance
 * @returns {{ state: 'on_track'|'at_risk'|'breached'|'met'|'n/a', remainingMs: number, percentElapsed: number, label: string }}
 */
export const getSlaStatus = (grievance) => {
  if (!grievance || !grievance.sla?.dueAt || !grievance.createdAt) {
    return {
      state: 'n/a',
      remainingMs: 0,
      percentElapsed: 0,
      label: 'N/A',
    };
  }

  const createdTime = new Date(grievance.createdAt).getTime();
  const dueTime = new Date(grievance.sla.dueAt).getTime();
  const defaultHours = SLA_HOURS[grievance.priority] || 96;
  const totalDuration = Math.max(dueTime - createdTime, defaultHours * 60 * 60 * 1000);

  // If already resolved or closed, evaluate against actual resolution time
  if (['Resolved', 'Closed'].includes(grievance.status)) {
    const resolvedAt = grievance.resolution?.resolvedAt
      ? new Date(grievance.resolution.resolvedAt).getTime()
      : new Date(grievance.updatedAt || grievance.createdAt).getTime();

    const elapsedMs = Math.max(0, resolvedAt - createdTime);
    const percentElapsed = Math.min(100, Math.round((elapsedMs / totalDuration) * 100));

    if (resolvedAt <= dueTime) {
      return {
        state: 'met',
        remainingMs: 0,
        percentElapsed,
        label: 'Resolved within SLA',
      };
    } else {
      const overdueHrs = Math.max(1, Math.round((resolvedAt - dueTime) / (1000 * 60 * 60)));
      return {
        state: 'breached',
        remainingMs: 0,
        percentElapsed: 100,
        label: overdueHrs > 24 ? `Resolved ${Math.floor(overdueHrs / 24)}d late` : `Resolved ${overdueHrs}h late`,
      };
    }
  }

  // Active / unresolved grievance calculation
  const now = Date.now();
  const remainingMs = dueTime - now;
  const elapsedMs = Math.max(0, now - createdTime);
  const percentElapsed = Math.min(100, Math.round((elapsedMs / totalDuration) * 100));

  if (remainingMs <= 0 || grievance.status === 'Escalated' || grievance.sla?.breached) {
    const overdueHrs = Math.max(1, Math.round(Math.abs(remainingMs) / (1000 * 60 * 60)));
    const days = Math.floor(overdueHrs / 24);
    const hrs = overdueHrs % 24;
    const label = days > 0 ? `Overdue by ${days}d ${hrs}h` : `Overdue by ${overdueHrs}h`;

    return {
      state: 'breached',
      remainingMs,
      percentElapsed: 100,
      label,
    };
  }

  const remainingHrs = Math.max(1, Math.round(remainingMs / (1000 * 60 * 60)));
  const days = Math.floor(remainingHrs / 24);
  const hrs = remainingHrs % 24;
  const timeStr = days > 0 ? `${days}d ${hrs}h left` : `${remainingHrs}h left`;

  if (percentElapsed >= 75) {
    return {
      state: 'at_risk',
      remainingMs,
      percentElapsed,
      label: `At Risk • ${timeStr}`,
    };
  }

  return {
    state: 'on_track',
    remainingMs,
    percentElapsed,
    label: `On Track • ${timeStr}`,
  };
};

/**
 * Evaluates SLA rules on an active grievance and applies escalation or warnings if triggered.
 *
 * Rules:
 * 1. Breached (past dueAt) & level 0 -> Escalate to level 1, transition to "Escalated", notify officer + admins.
 * 2. Breached & level 1 & overdue by > 50% extra SLA window -> Escalate to level 2 (raise priority one tier, add timeline entry, notify admins).
 * 3. At Risk (>75% window elapsed) & not yet warned -> Send sla_warning to assigned officer once, set warnedAtRisk = true.
 *
 * @param {Object} grievance Mongoose Grievance document
 * @param {Object} systemActor
 * @returns {Promise<{ action: string|null, grievance: Object }>}
 */
export const evaluateGrievanceSla = async (grievance, systemActor = { _id: null, role: 'admin' }) => {
  if (!grievance || ['Resolved', 'Closed'].includes(grievance.status)) {
    return { action: null, grievance };
  }

  const now = Date.now();
  const createdTime = new Date(grievance.createdAt).getTime();
  const dueTime = new Date(grievance.sla.dueAt).getTime();
  const defaultHours = SLA_HOURS[grievance.priority] || 96;
  const totalDuration = Math.max(dueTime - createdTime, defaultHours * 60 * 60 * 1000);

  // 1. Check if Breached
  if (now > dueTime) {
    const currentLevel = grievance.sla?.escalationLevel || 0;

    // Rule 1: Escalation Level 1
    if (currentLevel === 0 || grievance.status !== 'Escalated') {
      try {
        grievance.sla.breached = true;
        grievance.sla.escalationLevel = 1;
        grievance.sla.escalatedAt = new Date();

        const updated = await applyTransition(
          grievance,
          'Escalated',
          systemActor,
          'Automated SLA monitoring: Target resolution deadline breached. Escalated to Tier 1 supervisory review.'
        );

        return { action: 'escalate_level_1', grievance: updated };
      } catch (err) {
        console.error(`SLA Level 1 escalation error for ${grievance.trackingId}:`, err.message);
      }
    }

    // Rule 2: Escalation Level 2 (if overdue by additional 50% SLA window)
    const extraWindow = totalDuration * 0.5;
    if (now > (dueTime + extraWindow) && currentLevel < 2) {
      try {
        const oldPriority = grievance.priority;
        const newPriority = NEXT_PRIORITY[oldPriority] || oldPriority;

        grievance.sla.escalationLevel = 2;
        grievance.priority = newPriority;

        grievance.timeline.push({
          status: 'Escalated',
          title: `Tier 2 Critical Escalation (+50% SLA Overdue)`,
          note: `Statutory SLA exceeded by over 50%. System upgraded priority from ${oldPriority} to ${newPriority}. Flagged for Municipal Commissioner intervention.`,
          actor: systemActor._id,
          actorRole: 'system',
          isInternal: false,
          createdAt: new Date(),
        });

        await grievance.save();

        // Alert admins of Tier 2 critical escalation
        await notifyAdmins({
          type: 'escalation',
          title: `CRITICAL: ${grievance.trackingId} Escalated to Tier 2`,
          message: `Ticket "${grievance.title}" has exceeded SLA by 50%+. Priority auto-promoted to ${newPriority}. Immediate municipal review required.`,
          grievanceId: grievance._id,
          data: { trackingId: grievance.trackingId, priority: newPriority, level: 2 },
        });

        return { action: 'escalate_level_2', grievance };
      } catch (err) {
        console.error(`SLA Level 2 escalation error for ${grievance.trackingId}:`, err.message);
      }
    }
  } else {
    // 2. Not breached yet: Check for At-Risk Warning (>75% window elapsed)
    const elapsedMs = Math.max(0, now - createdTime);
    const percentElapsed = Math.round((elapsedMs / totalDuration) * 100);

    if (percentElapsed >= 75 && !grievance.sla?.warnedAtRisk) {
      try {
        const remainingHours = Math.max(1, Math.round((dueTime - now) / (1000 * 60 * 60)));
        grievance.sla.warnedAtRisk = true;
        await grievance.save();

        if (grievance.assignedOfficer) {
          const officerId = grievance.assignedOfficer._id || grievance.assignedOfficer;
          await notifySlaWarning(officerId, grievance, remainingHours);
        }

        return { action: 'warn_at_risk', grievance };
      } catch (err) {
        console.error(`SLA Warning notification error for ${grievance.trackingId}:`, err.message);
      }
    }
  }

  return { action: null, grievance };
};

export default {
  getSlaStatus,
  evaluateGrievanceSla,
};
