import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const MentorFilter = ({ filters, onChange }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
      <SlidersHorizontal className="w-4 h-4 text-brand-600" />
      Filters
    </div>
    <input
      type="text"
      value={filters.expertise}
      onChange={(event) => onChange({ ...filters, expertise: event.target.value })}
      placeholder="Expertise"
      aria-label="Filter by expertise"
      className="w-full sm:w-48 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
    />
    <select
      value={filters.rating}
      onChange={(event) => onChange({ ...filters, rating: event.target.value })}
      aria-label="Filter by minimum rating"
      className="w-full sm:w-40 px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
    >
      <option value="">Any rating</option>
      <option value="4">4.0+ rating</option>
      <option value="4.5">4.5+ rating</option>
    </select>
  </div>
);

export default MentorFilter;