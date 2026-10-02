import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  if (count > 1) {
    return (
      <div className="space-y-2.5 w-full">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className || 'h-4 w-full'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className || 'h-4 w-full'}`}
    />
  );
};

export default Skeleton;
