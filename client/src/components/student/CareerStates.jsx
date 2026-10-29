import React from 'react';
import { AlertCircle, BriefcaseBusiness } from 'lucide-react';
import Button from '../common/Button';

export const LoadingState = ({ label = 'Loading...' }) => (
  <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500" aria-live="polite">
    <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    {label}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="rounded-3xl border border-red-100 bg-white p-8 text-center">
    <AlertCircle className="mx-auto h-9 w-9 text-red-500" />
    <p className="mt-3 text-sm text-red-700">{message}</p>
    {onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}>Try again</Button>}
  </div>
);

export const EmptyState = ({ title, message }) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
    <BriefcaseBusiness className="mx-auto h-9 w-9 text-slate-300" />
    <h3 className="mt-3 font-semibold text-slate-800">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{message}</p>
  </div>
);
