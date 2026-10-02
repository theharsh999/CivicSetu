import React from 'react';
import {
  CheckCircle2,
  Clock,
  Send,
  Bot,
  UserCheck,
  Eye,
  AlertTriangle,
  Archive,
  ArrowRight,
} from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export const StatusTimeline = ({ timeline = [], className = '' }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">No timeline entries recorded yet.</p>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <Send className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
      case 'AI Classified':
        return <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Assigned':
        return <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Awaiting Verification':
        return <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Closed':
        return <Archive className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />;
      case 'Escalated':
        return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCircleBg = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700';
      case 'AI Classified':
        return 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800';
      case 'Assigned':
        return 'bg-blue-50 border-blue-300 dark:bg-blue-950/60 dark:border-blue-800';
      case 'In Progress':
        return 'bg-amber-50 border-amber-300 dark:bg-amber-950/60 dark:border-amber-800';
      case 'Awaiting Verification':
        return 'bg-purple-50 border-purple-300 dark:bg-purple-950/60 dark:border-purple-800';
      case 'Resolved':
        return 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800';
      case 'Closed':
        return 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700';
      case 'Escalated':
        return 'bg-rose-50 border-rose-300 dark:bg-rose-950/60 dark:border-rose-800';
      default:
        return 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`relative pl-6 space-y-6 ${className}`}>
      {/* Connecting Vertical Line */}
      <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-slate-200 dark:bg-slate-800" />

      {timeline.map((entry, idx) => {
        const isLatest = idx === timeline.length - 1;

        return (
          <div key={entry._id || idx} className="relative flex items-start gap-4 group">
            {/* Timeline Dot with Icon */}
            <div
              className={`absolute -left-6 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-transform ${
                isLatest ? 'ring-4 ring-brand-100 dark:ring-brand-950/60 scale-110' : ''
              } ${getCircleBg(entry.status)}`}
            >
              {getStatusIcon(entry.status)}
            </div>

            {/* Content Card */}
            <div className="flex-1 bg-slate-50/80 dark:bg-slate-850 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl p-3.5 shadow-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    {entry.title}
                  </h4>
                  <StatusBadge status={entry.status} size="sm" />
                  {entry.isInternal && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Internal Only
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDate(entry.createdAt)}
                </span>
              </div>

              {entry.note && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 whitespace-pre-line">
                  {entry.note}
                </p>
              )}

              {entry.actorRole && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <span>Action by:</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                    {entry.actor?.name ? `${entry.actor.name} (${entry.actorRole})` : entry.actorRole}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
