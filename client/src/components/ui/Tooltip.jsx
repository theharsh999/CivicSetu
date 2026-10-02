import React, { useState } from 'react';

export const Tooltip = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute ${positions[position] || positions.top} z-40 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-slate-800 rounded-md shadow-md whitespace-nowrap pointer-events-none animate-fade-in border border-slate-700/60`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
