import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Layers, ShieldCheck } from 'lucide-react';

const MentorPlaceholder = () => {
  const location = useLocation();

  const getModuleInfo = () => {
    const p = location.pathname;
    if (p.includes('/sessions')) return { name: 'Mentor Session Scheduler', breakpoint: 'Breakpoint 3', desc: 'Calendar management, 1-on-1 video room allocation, and availability controls.' };
    if (p.includes('/assessments')) return { name: 'Student Assessment Engine', breakpoint: 'Breakpoint 4', desc: 'Code review evaluation rubric, grading system, and skill score validation.' };
    return { name: 'Mentor Sub-Module', breakpoint: 'Future Breakpoint', desc: 'This mentor tool will be implemented in its designated development breakpoint.' };
  };

  const info = getModuleInfo();

  return (
    <div className="py-12 px-4 max-w-3xl mx-auto text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto ring-8 ring-purple-50/50">
        <Layers className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Scheduled for {info.breakpoint}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{info.name}</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">{info.desc}</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-150 shadow-sm max-w-lg mx-auto text-left space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Breakpoint 1 Foundation Active
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          The Mentor Dashboard foundation and role-based navigation are fully active.
        </p>
      </div>
    </div>
  );
};

export default MentorPlaceholder;
