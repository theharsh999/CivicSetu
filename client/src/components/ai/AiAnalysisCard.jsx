import React from 'react';
import {
  Sparkles,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Tag,
  ArrowRight,
  Droplets,
  Hammer,
  Zap,
  Trash2,
  Waves,
  HeartPulse,
  Car,
  Trees,
  HelpCircle,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { PriorityBadge } from '../ui/PriorityBadge';
import { DEPARTMENT_MAP } from '../../utils/constants';

const DEPT_ICONS = {
  ROADS: Hammer,
  WATER: Droplets,
  ELEC: Zap,
  WASTE: Trash2,
  DRAIN: Waves,
  HEALTH: HeartPulse,
  TRAFFIC: Car,
  PARKS: Trees,
  OTHER: HelpCircle,
};

export const AiAnalysisCard = ({
  analysis,
  isLoading = false,
  error = null,
  onApply = null,
  onSelectAlternative = null,
  showApplyButton = false,
  className = '',
  compact = false,
}) => {
  if (isLoading) {
    return (
      <div
        className={`p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-slate-900 animate-pulse ${className}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-200 dark:bg-indigo-800 animate-spin" />
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Analyzing text with rule-based NLP engine...
            </span>
          </div>
          <div className="h-4 w-36 bg-indigo-100 dark:bg-indigo-900/60 rounded" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex gap-3">
            <div className="h-7 w-28 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg" />
            <div className="h-7 w-40 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg" />
            <div className="h-7 w-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg" />
          </div>
          <div className="h-2 w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-full" />
          <div className="h-4 w-5/6 bg-indigo-100 dark:bg-indigo-900/20 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5 ${className}`}
      >
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">AI suggestion unavailable</p>
          <p className="text-amber-700 dark:text-amber-300 mt-0.5">
            {error || 'Could not parse text automatically. You can choose department & category manually below.'}
          </p>
        </div>
      </div>
    );
  }

  if (!analysis || !analysis.department) {
    return null;
  }

  const deptMeta = DEPARTMENT_MAP[analysis.department] || {
    name: analysis.department,
    color: '#6366f1',
    icon: 'HelpCircle',
  };

  const DeptIcon = DEPT_ICONS[analysis.department] || HelpCircle;
  const confidencePercent = Math.round((analysis.confidence || 0) * 100);

  // Confidence color scale
  const confidenceColor =
    confidencePercent >= 80
      ? 'bg-emerald-500'
      : confidencePercent >= 65
      ? 'bg-indigo-500'
      : 'bg-amber-500';

  const confidenceBadgeColor =
    confidencePercent >= 80
      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200'
      : confidencePercent >= 65
      ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200'
      : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200';

  return (
    <div
      className={`rounded-xl border border-indigo-200/90 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 shadow-sm overflow-hidden ${className}`}
    >
      {/* Top Banner with Prototype AI Engine Label */}
      <div className="px-4 py-2.5 bg-indigo-100/60 dark:bg-indigo-950/50 border-b border-indigo-200/60 dark:border-indigo-800/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
            AI Automated Analysis
          </span>
          {analysis.needsManualReview && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              Low Confidence - Needs Review
            </span>
          )}
          {analysis.overridden && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-700">
              <Sliders className="w-3 h-3 text-purple-600" />
              Category corrected by officer
            </span>
          )}
        </div>

        {/* Honest Prototype Label */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/70 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span>Prototype AI engine (rule-based)</span>
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        {/* Classification highlights */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Pill */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-xs"
              style={{ backgroundColor: deptMeta.color || '#6366f1' }}
            >
              <DeptIcon className="w-3.5 h-3.5 text-white/90" />
              <span>{deptMeta.name}</span>
            </div>

            {/* Category Pill */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>{analysis.category}</span>
            </div>

            {/* Priority Badge */}
            <PriorityBadge priority={analysis.priority || 'Medium'} size="sm" />
          </div>

          {/* Confidence Meter */}
          <div className="flex items-center gap-2 min-w-[140px]">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Confidence
              </div>
              <div
                className={`text-xs font-bold px-1.5 py-0.5 rounded border inline-block ${confidenceBadgeColor}`}
              >
                {confidencePercent}%
              </div>
            </div>
            <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${confidenceColor} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(100, Math.max(15, confidencePercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Human-readable Reasoning */}
        {analysis.reasoning && (
          <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200">
            <span className="font-semibold text-indigo-800 dark:text-indigo-300">Reasoning: </span>
            {analysis.reasoning}
          </div>
        )}

        {/* Urgency Signals */}
        {analysis.urgencySignals && analysis.urgencySignals.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1 mr-1">
              <Clock className="w-3 h-3 text-rose-500" /> Urgency Triggers:
            </span>
            {analysis.urgencySignals.map((signal, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50"
              >
                {signal}
              </span>
            ))}
          </div>
        )}

        {/* Detected Keywords Chips */}
        {analysis.keywords && analysis.keywords.length > 0 && !compact && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
              Detected Signals:
            </span>
            {analysis.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* Alternative Categories (if runner-up was close) */}
        {analysis.alternatives && analysis.alternatives.length > 0 && !compact && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Alternative matches considered:
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.alternatives.map((alt, idx) => {
                const altDept = DEPARTMENT_MAP[alt.department];
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => onSelectAlternative && onSelectAlternative(alt)}
                    disabled={!onSelectAlternative}
                    className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                      onSelectAlternative
                        ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        : 'border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className="font-medium">{alt.category}</span>
                    <span className="text-[10px] text-slate-400">({Math.round((alt.confidence || 0) * 100)}%)</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button: Apply Suggestion in Lodge flow */}
        {showApplyButton && onApply && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onApply}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-200 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:hover:bg-indigo-800 rounded-lg transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Apply AI Suggestion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAnalysisCard;
