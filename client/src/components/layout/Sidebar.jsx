import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Video,
  Users,
  Code2,
  Award,
  LineChart,
  BarChart3,
  Trophy,
  Briefcase,
  Bell,
  Settings,
  HelpCircle,
  MessageSquare,
  FileCheck,
  Building2,
  GraduationCap,
  Sparkles,
  X,
  ShieldCheck,
  FileText,
  UserCheck,
  Sliders,
  User,
  Calendar,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const role = user?.role || 'student';

  const navConfigs = {
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Courses', path: '/student/courses', icon: BookOpen },
      { name: 'My Learning / My Courses', path: '/student/my-courses', icon: GraduationCap },
      { name: 'Learning Path', path: '/student/learning-path', icon: Compass },
      { name: 'Practice Zone', path: '/student/practice', icon: Code2 },
      { name: 'Assessment Center', path: '/student/assessments', icon: FileCheck },
      { name: 'Exams & Assignments', path: '/student/exams', icon: FileText },
      { name: 'Student Performance', path: '/student/performance', icon: BarChart3 },
      { name: 'Live Classes', path: '/student/live-classes', icon: Video },
      { name: 'Mentor Connect', path: '/student/mentors', icon: Users },
      { name: 'Certificates', path: '/student/certificates', icon: Award },
      { name: 'Skill Tracker', path: '/student/skills', icon: LineChart },
      { name: 'Career & Jobs', path: '/student/career', icon: Briefcase },
      { name: 'Notifications', path: '/student/notifications', icon: Bell },
      { name: 'Settings', path: '/student/settings', icon: Settings },
      { name: 'Help & Support', path: '/student/support', icon: HelpCircle },
    ],
    mentor: [
      { name: 'Dashboard', path: '/mentor/dashboard', icon: LayoutDashboard },
      { name: 'My Students', path: '/mentor/students', icon: GraduationCap },
      { name: 'Mentor Sessions', path: '/mentor/sessions', icon: Calendar },
      { name: 'Mentor Connect', path: '/mentor/connect', icon: UserCheck },
      { name: 'Messages', path: '/mentor/messages', icon: MessageSquare },
      { name: 'Mentor Profile', path: '/mentor/profile', icon: User },
      { name: 'Availability', path: '/mentor/availability', icon: Sliders },
      { name: 'Live Classes', path: '/mentor/live-classes', icon: Video },
      { name: 'Notifications', path: '/mentor/notifications', icon: Bell },
      { name: 'Settings', path: '/mentor/settings', icon: Settings },
      { name: 'Help & Support', path: '/mentor/support', icon: HelpCircle },
    ],
    recruiter: [
      { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
      { name: 'Students', path: '/recruiter/students', icon: GraduationCap },
      { name: 'Skill Profiles', path: '/recruiter/skill-profiles', icon: ShieldCheck },
      { name: 'Candidates', path: '/recruiter/candidates', icon: Users },
      { name: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
      { name: 'Internships', path: '/recruiter/internships', icon: Building2 },
      { name: 'Placement', path: '/recruiter/placement', icon: Award },
      { name: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
      { name: 'Notifications', path: '/recruiter/notifications', icon: Bell },
      { name: 'Settings', path: '/recruiter/settings', icon: Settings },
      { name: 'Help & Support', path: '/recruiter/support', icon: HelpCircle },
    ],
  };

  const navItems = navConfigs[role] || navConfigs.student;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-navy-950 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800/80 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* TOP BRAND HEADER */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-purple flex items-center justify-center text-white shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-white tracking-wide text-lg flex items-center gap-1.5">
                  FinTrack<span className="text-brand-400 font-light">Edu</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                  {role} Portal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* NAVIGATION LINKS */}
          <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                    }`}
                  />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* BOTTOM USER ROLE & VERIFIED FOOTER */}
        <div className="p-4 border-t border-slate-800/60 bg-navy-900/40">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs text-slate-400">
              <span className="text-slate-200 font-medium">Naan Mudhalvan</span> Aligned Platform
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
