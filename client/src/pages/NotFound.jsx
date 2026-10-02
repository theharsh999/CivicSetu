import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 shadow-sm border border-brand-100 dark:border-brand-900/40">
        <FileQuestion className="w-10 h-10" />
      </div>
      <span className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        404 Error
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2">
        The municipal portal page or grievance record you are looking for doesn't exist or has been relocated.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/track">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Track a Grievance
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
