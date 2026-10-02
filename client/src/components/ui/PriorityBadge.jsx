import React from 'react';
import { PRIORITY_CONFIG } from '../../utils/constants.js';

export const PriorityBadge = ({ priority, size = 'md', className = '' }) => {
  const config = PRIORITY_CONFIG[priority] || {
    label: priority || 'Normal',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizes[size] || sizes.md} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0" />
      {config.label || priority}
    </span>
  );
};

export default PriorityBadge;
