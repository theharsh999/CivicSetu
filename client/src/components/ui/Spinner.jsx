import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '', text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-brand-600 dark:text-brand-400 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin`} />
      {text && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{text}</span>}
    </div>
  );
};

export default Spinner;
