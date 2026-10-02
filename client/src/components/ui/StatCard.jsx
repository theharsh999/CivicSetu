import React from 'react';
import Card from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color = 'brand',
  className = '',
}) => {
  const colorStyles = {
    brand: {
      bg: 'bg-brand-50 dark:bg-brand-950/50',
      text: 'text-brand-600 dark:text-brand-400',
      border: 'border-brand-200 dark:border-brand-900/60',
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-950/50',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-200 dark:border-teal-900/60',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-900/60',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-900/60',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-900/60',
    },
  };

  const selectedColor = colorStyles[color] || colorStyles.brand;

  return (
    <Card hover className={`p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${selectedColor.bg} ${selectedColor.text} ${selectedColor.border} shadow-sm shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs">
          {trend.direction === 'up' && (
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          {trend.direction === 'down' && (
            <span className="flex items-center text-rose-600 dark:text-rose-400 font-semibold">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          {trend.direction === 'neutral' && (
            <span className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          <span className="text-slate-400 dark:text-slate-500">
            {trend.label}
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
