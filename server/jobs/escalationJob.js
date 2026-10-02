import cron from 'node-cron';
import Grievance from '../models/Grievance.js';
import { evaluateGrievanceSla } from '../services/slaService.js';
import { applyTransition } from '../services/workflowService.js';

/**
 * Runs the central SLA check and auto-close sweeps across all grievances.
 * Can be invoked by the scheduled cron runner or manually by an admin via API.
 *
 * @returns {Promise<{ checkedCount: number, escalatedLevel1Count: number, escalatedLevel2Count: number, warnedCount: number, autoClosedCount: number, timestamp: Date }>}
 */
export const runEscalationCheck = async () => {
  const systemActor = { _id: null, role: 'admin' };
  let checkedCount = 0;
  let escalatedLevel1Count = 0;
  let escalatedLevel2Count = 0;
  let warnedCount = 0;
  let autoClosedCount = 0;

  try {
    // 1. Process active unresolved grievances for SLA warning and escalation
    const activeGrievances = await Grievance.find({
      status: { $nin: ['Resolved', 'Closed'] },
    }).populate('assignedOfficer department citizen');

    checkedCount = activeGrievances.length;

    for (const grievance of activeGrievances) {
      try {
        const { action } = await evaluateGrievanceSla(grievance, systemActor);
        if (action === 'escalate_level_1') escalatedLevel1Count++;
        else if (action === 'escalate_level_2') escalatedLevel2Count++;
        else if (action === 'warn_at_risk') warnedCount++;
      } catch (itemErr) {
        console.error(`Error processing SLA for ${grievance.trackingId}:`, itemErr.message);
      }
    }

    // 2. Auto-close sweeps: Grievances resolved > 7 days ago without citizen feedback or dispute
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const resolvedGrievances = await Grievance.find({
      status: 'Resolved',
      $or: [
        { 'resolution.resolvedAt': { $lte: sevenDaysAgo } },
        { 'resolution.resolvedAt': null, updatedAt: { $lte: sevenDaysAgo } },
      ],
    }).populate('citizen assignedOfficer department');

    for (const grievance of resolvedGrievances) {
      try {
        await applyTransition(
          grievance,
          'Closed',
          systemActor,
          'Case automatically closed by system governance: Remained in Resolved status for >7 days without citizen objection.'
        );
        autoClosedCount++;
      } catch (closeErr) {
        console.error(`Error auto-closing resolved grievance ${grievance.trackingId}:`, closeErr.message);
      }
    }

    const summary = {
      checkedCount,
      escalatedLevel1Count,
      escalatedLevel2Count,
      warnedCount,
      autoClosedCount,
      timestamp: new Date(),
    };

    console.log(
      `[SLA-ENGINE] Check finished at ${summary.timestamp.toISOString()}: ` +
      `${checkedCount} checked, ${escalatedLevel1Count} escalated (L1), ${escalatedLevel2Count} critical (L2), ` +
      `${warnedCount} warned, ${autoClosedCount} auto-closed.`
    );

    return summary;
  } catch (error) {
    console.error('[SLA-ENGINE] Fatal error during SLA escalation run:', error.message);
    return {
      checkedCount,
      escalatedLevel1Count,
      escalatedLevel2Count,
      warnedCount,
      autoClosedCount,
      error: error.message,
      timestamp: new Date(),
    };
  }
};

/**
 * Initializes the node-cron scheduled job
 */
export const startEscalationJob = () => {
  if (process.env.ESCALATION_JOB_ENABLED === 'false') {
    console.log('[SLA-ENGINE] Scheduled escalation cron is disabled via ESCALATION_JOB_ENABLED=false');
    return null;
  }

  // Run every 15 minutes
  const task = cron.schedule('*/15 * * * *', async () => {
    console.log('[SLA-ENGINE] Triggering scheduled 15-minute SLA evaluation sweep...');
    await runEscalationCheck();
  });

  console.log('[SLA-ENGINE] Scheduled SLA escalation cron registered (frequency: every 15 minutes)');
  return task;
};

export default {
  runEscalationCheck,
  startEscalationJob,
};
