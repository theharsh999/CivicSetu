import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SLA_HOURS } from '../../utils/constants';

/**
 * Enhanced SlaBadge & SlaIndicator component
 * Computes On track / At risk / Breached / Met SLA status with optional progress bar and escalation pill.
 *
 * @param {Object} props
 * @param {string|Date} [props.dueAt]
 * @param {string} [props.status]
 * @param {string|Date} [props.createdAt]
 * @param {Object} [props.grievance] - Optional full grievance object
 * @param {boolean} [props.showProgress=false]
 * @param {boolean} [props.showEscalationPill=true]
 * @param {string} [props.className='']
 */
export const SlaBadge = ({
  dueAt: propDueAt,
  status: propStatus,
  createdAt: propCreatedAt,
  grievance = null,
  showProgress = false,
  showEscalationPill = true,
  className = '',
}) => {
  const g = grievance || {};
  const status = propStatus || g.status || 'Submitted';
  const dueAt = propDueAt || g.sla?.dueAt;
  const createdAt = propCreatedAt || g.createdAt;
  const escalationLevel = g.sla?.escalationLevel || 0;
  const isBreached = g.sla?.breached || status === 'Escalated';

  if (!dueAt) {
    return (
      <span className={`text-[11px] text-slate-400 font-mono ${className}`}>
        No SLA Target
      </span>
    );
  }

  const createdTime = createdAt ? new Date(createdAt).getTime() : Date.now() - 24 * 3600000;
  const dueTime = new Date(dueAt).getTime();
  const defaultDuration = (SLA_HOURS[g.priority] || 96) * 60 * 60 * 1000;
  const totalDuration = Math.max(dueTime - createdTime, defaultDuration);

  // 1. Resolved or Closed evaluation
  if (['Resolved', 'Closed'].includes(status)) {
    const resolvedAt = g.resolution?.resolvedAt
      ? new Date(g.resolution.resolvedAt).getTime()
      : g.updatedAt
      ? new Date(g.updatedAt).getTime()
      : dueTime - 3600000;

    const met = resolvedAt <= dueTime && !isBreached;

    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            met
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {met ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Met SLA</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>Resolved late</span>
            </>
          )}
        </span>
      </div>
    );
  }

  // 2. Active unresolved grievance calculation
  const now = Date.now();
  const remainingMs = dueTime - now;
  const elapsedMs = Math.max(0, now - createdTime);
  const percentElapsed = Math.min(100, Math.round((elapsedMs / totalDuration) * 100));

  // Breached / Overdue
  if (remainingMs <= 0 || isBreached) {
    const overdueHrs = Math.max(1, Math.round(Math.abs(remainingMs) / (1000 * 60 * 60)));
    const days = Math.floor(overdueHrs / 24);
    const hrs = overdueHrs % 24;
    const timeLabel = days > 0 ? `${days}d ${hrs}h late` : `${overdueHrs}h late`;

    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>Breached • {timeLabel}</span>
          </span>

          {showEscalationPill && escalationLevel > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                escalationLevel >= 2
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
              }`}
            >
              {escalationLevel >= 2 ? 'Tier 2 Critical' : 'Tier 1 Escalated'}
            </span>
          )}
        </div>

        {showProgress && (
          <div className="w-full h-1 bg-rose-200 dark:bg-rose-900/60 rounded-full overflow-hidden">
            <div className="h-full bg-rose-600 rounded-full w-full" />
          </div>
        )}
      </div>
    );
  }

  // At Risk (>75% window elapsed)
  const remainingHours = Math.max(1, Math.round(remainingMs / (1000 * 60 * 60)));
  const daysLeft = Math.floor(remainingHours / 24);
  const hrsLeft = remainingHours % 24;
  const countdownLabel = daysLeft > 0 ? `${daysLeft}d ${hrsLeft}h left` : `${remainingHours}h left`;

  if (percentElapsed >= 75) {
    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>At Risk • {countdownLabel}</span>
        </span>
        {showProgress && (
          <div className="w-full h-1 bg-amber-200 dark:bg-amber-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${percentElapsed}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // On Track (<75% window elapsed)
  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>On Track • {countdownLabel}</span>
      </span>
      {showProgress && (
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${percentElapsed}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const SlaIndicator = SlaBadge;

export default SlaBadge;
