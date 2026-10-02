import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    info: (message, title = 'Notice') => addToast({ type: 'info', title, message }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Portal / Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let icon = <Info className="w-5 h-5 text-sky-500 shrink-0" />;
          let borderClass = 'border-sky-300 dark:border-sky-800';
          let bgClass = 'bg-white dark:bg-slate-900';

          if (t.type === 'success') {
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
            borderClass = 'border-emerald-300 dark:border-emerald-800';
          } else if (t.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
            borderClass = 'border-rose-300 dark:border-rose-800';
          } else if (t.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
            borderClass = 'border-amber-300 dark:border-amber-800';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgClass} ${borderClass} transition-all duration-300 animate-slide-up text-slate-800 dark:text-slate-100`}
            >
              {icon}
              <div className="flex-1 text-sm">
                {t.title && <h5 className="font-semibold text-slate-900 dark:text-white leading-tight mb-0.5">{t.title}</h5>}
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
