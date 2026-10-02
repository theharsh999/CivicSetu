import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 ${className}`}>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {totalItems ? (
          <span>
            Showing <strong className="text-slate-700 dark:text-slate-200">{startItem}</strong> to{' '}
            <strong className="text-slate-700 dark:text-slate-200">{endItem}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-700 dark:text-slate-200">{currentPage}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            // Only show reasonable window of pages if totalPages is large
            if (
              totalPages > 7 &&
              page !== 1 &&
              page !== totalPages &&
              Math.abs(page - currentPage) > 1
            ) {
              if (page === 2 || page === totalPages - 1) {
                return (
                  <span key={page} className="px-1 text-slate-400 text-xs">
                    ...
                  </span>
                );
              }
              return null;
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
