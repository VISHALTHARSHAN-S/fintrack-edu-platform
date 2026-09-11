import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';

const StudentPlaceholder = () => {
  const location = useLocation();

  const getModuleInfo = () => {
    const p = location.pathname;
    if (p.includes('/courses')) return { name: 'Student Learning Ecosystem', breakpoint: 'Breakpoint 2', desc: 'Interactive course engine, financial video lectures, code runner, and module tracking.' };
    if (p.includes('/live-classes')) return { name: 'Live Video Learning Infrastructure', breakpoint: 'Breakpoint 3', desc: 'WebRTC live classrooms, interactive Q&A, and attendance verification.' };
    if (p.includes('/mentors')) return { name: 'Mentor Connect Booking', breakpoint: 'Breakpoint 3', desc: '1-on-1 mentor slot scheduling, calendar synchronization, and code review requests.' };
    if (p.includes('/practice')) return { name: 'FinTech Practice & Algorithmic Sandbox', breakpoint: 'Breakpoint 4', desc: 'Real-time market data simulator, backtesting engine, and financial risk models.' };
    if (p.includes('/certificates')) return { name: 'Micro-Credential Ledger & NFT Certificates', breakpoint: 'Breakpoint 4', desc: 'Cryptographically signed skill certificates aligned with Naan Mudhalvan standards.' };
    if (p.includes('/skills')) return { name: 'AI-Powered Skill Tracker & Matrix', breakpoint: 'Breakpoint 4', desc: 'Personalized AI skill recommendations, strength analysis, and badge progression.' };
    if (p.includes('/career')) return { name: 'Career & Placement Hub', breakpoint: 'Breakpoint 5', desc: 'Recruiter job match engine, resume builder, and placement interview scheduling.' };
    return { name: 'FinTech Sub-Module', breakpoint: 'Future Breakpoint', desc: 'This specialized module will be unlocked in the upcoming development breakpoint.' };
  };

  const info = getModuleInfo();

  return (
    <div className="py-12 px-4 max-w-3xl mx-auto text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto ring-8 ring-brand-50/50">
        <Layers className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
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
          The core authentication, role-based navigation, sidebar header components, and Redux architecture are fully operational and ready to receive this module.
        </p>
      </div>
    </div>
  );
};

export default StudentPlaceholder;
