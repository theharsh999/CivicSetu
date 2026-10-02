import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const icons = {
    danger: <div className="p-3 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full"><AlertTriangle className="w-6 h-6" /></div>,
    warning: <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full"><AlertTriangle className="w-6 h-6" /></div>,
    primary: <div className="p-3 bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 rounded-full"><Info className="w-6 h-6" /></div>,
    success: <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showClose={!isLoading}>
      <div className="flex flex-col items-center text-center">
        {icons[variant] || icons.primary}
        <h4 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'warning' ? 'primary' : variant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
