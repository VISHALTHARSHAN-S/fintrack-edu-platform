import React from 'react';

export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="h-8 bg-slate-200 rounded w-1/2"></div>
    <div className="h-3 bg-slate-150 rounded w-3/4"></div>
  </div>
);

export const ListSkeleton = ({ rows = 4, className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4 ${className}`}>
    <div className="h-5 bg-slate-200 rounded w-1/4 mb-6"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
        <div className="flex items-center space-x-3 w-2/3">
          <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0"></div>
          <div className="space-y-1.5 w-full">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-150 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-6 bg-slate-200 rounded w-16"></div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
    <div className="p-4 border-b border-slate-100 flex justify-between">
      <div className="h-5 bg-slate-200 rounded w-1/4"></div>
      <div className="h-8 bg-slate-200 rounded w-1/6"></div>
    </div>
    <div className="p-4 space-y-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid grid-cols-4 gap-4 py-2 border-b border-slate-50">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 bg-slate-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default CardSkeleton;
