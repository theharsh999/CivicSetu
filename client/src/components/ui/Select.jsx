import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  placeholder = 'Select an option...',
  className = '',
  id,
  required,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`w-full rounded-lg text-sm bg-white dark:bg-slate-900 border appearance-none transition-colors duration-150 pl-3.5 pr-10 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent ${
            error
              ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
              : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => {
                const value = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                return (
                  <option key={value} value={value}>
                    {optLabel}
                  </option>
                );
              })
            : children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
