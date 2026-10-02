import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading the requested data.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm border border-rose-200 dark:border-rose-800">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm">
        {message}
      </p>

      {onRetry && (
        <div className="mt-5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
