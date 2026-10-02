import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data to display here.',
  actionLabel,
  onAction,
  className = '',
  children
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-sm border border-brand-100 dark:border-brand-900/40">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default EmptyState;
