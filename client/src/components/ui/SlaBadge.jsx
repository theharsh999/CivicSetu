import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SlaBadge = ({ dueAt, status, className = '' }) => {
  if (['Resolved', 'Closed'].includes(status)) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 ${className}`}
      >
        <CheckCircle2 className="w-3 h-3" />
        <span>Resolved</span>
      </span>
    );
  }

  if (!dueAt) {
    return (
      <span className={`text-[11px] text-slate-400 font-mono ${className}`}>
        No SLA
      </span>
    );
  }

  const dueDate = new Date(dueAt);
  const now = new Date();
  const diffMs = dueDate - now;

  if (diffMs < 0) {
    // Overdue
    const overdueHours = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
    const overdueDays = Math.floor(overdueHours / 24);
    const label =
      overdueDays > 0
        ? `Overdue by ${overdueDays}d ${overdueHours % 24}h`
        : `Overdue by ${overdueHours}h`;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse ${className}`}
      >
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        <span>{label}</span>
      </span>
    );
  }

  // Not overdue yet
  const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  if (hoursLeft <= 24) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800 ${className}`}
      >
        <Clock className="w-3 h-3 text-amber-600" />
        <span>{hoursLeft}h left</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
    >
      <Clock className="w-3 h-3 text-slate-500" />
      <span>{daysLeft}d left</span>
    </span>
  );
};

export default SlaBadge;
