import React from 'react';

export const Avatar = ({
  name = 'User',
  src = '',
  size = 'md',
  className = '',
  status = null, // 'online' | 'busy' | 'offline'
}) => {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base font-bold',
  };

  const statusIndicators = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-slate-400',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size] || sizes.md} rounded-full object-cover ring-2 ring-white dark:ring-slate-900`}
        />
      ) : (
        <div
          className={`${sizes[size] || sizes.md} rounded-full bg-gradient-to-tr from-brand-600 to-civic-teal-500 text-white font-semibold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
            statusIndicators[status] || statusIndicators.online
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
