import React from 'react';
import { NavLink } from 'react-router-dom';
import { BriefcaseBusiness, CalendarDays, ListChecks, LayoutDashboard, UserRound } from 'lucide-react';

const items = [
  { label: 'Overview', to: '/student/career', icon: LayoutDashboard, end: true },
  { label: 'Find jobs', to: '/student/career/jobs', icon: BriefcaseBusiness },
  { label: 'Applications', to: '/student/career/applications', icon: ListChecks },
  { label: 'Interviews', to: '/student/career/interviews', icon: CalendarDays },
  { label: 'Career profile', to: '/student/career/profile', icon: UserRound },
];

const CareerNav = () => (
  <nav aria-label="Career navigation" className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
    {items.map(({ label, to, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          `inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${
            isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`
        }
      >
        <Icon className="h-4 w-4" /> {label}
      </NavLink>
    ))}
  </nav>
);

export default CareerNav;
