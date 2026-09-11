import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationPanel from './NotificationPanel';

const AppLayout = ({ title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitles = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return { title: 'Dashboard Overview', subtitle: 'Real-time performance metrics and quick actions' };
    if (path.includes('/courses')) return { title: 'FinTech Learning Engine', subtitle: 'Industry aligned courses & interactive modules' };
    if (path.includes('/live-classes')) return { title: 'Live Mentorship Classes', subtitle: 'Interactive live sessions with industry experts' };
    if (path.includes('/mentors') || path.includes('/sessions')) return { title: 'Mentor Connect', subtitle: 'Schedule 1-on-1 guidance & code reviews' };
    if (path.includes('/practice')) return { title: 'FinTech Practice Sandbox', subtitle: 'Simulate quantitative trading and financial models' };
    if (path.includes('/certificates')) return { title: 'Verified Micro-Credentials', subtitle: 'Naan Mudhalvan aligned skill certifications' };
    if (path.includes('/skills') || path.includes('/skill-profiles')) return { title: 'Skill Passport & Analytics', subtitle: 'Verified proof of technical competence' };
    if (path.includes('/progress')) return { title: 'Learning Progress & Insights', subtitle: 'Track your growth and milestone completions' };
    if (path.includes('/leaderboard')) return { title: 'Platform Leaderboard', subtitle: 'Top performers in quantitative finance challenges' };
    if (path.includes('/career') || path.includes('/jobs') || path.includes('/internships')) return { title: 'Career & Recruitment Hub', subtitle: 'Connect with top FinTech employers' };
    if (path.includes('/students') || path.includes('/candidates')) return { title: 'Candidate Skill Directory', subtitle: 'Verified job-ready FinTech candidates' };
    if (path.includes('/assessments')) return { title: 'Student Assessments', subtitle: 'Evaluate code quality and quantitative skills' };
    if (path.includes('/settings')) return { title: 'Account Settings', subtitle: 'Manage your profile and security preferences' };
    if (path.includes('/support')) return { title: 'Help & Support Center', subtitle: 'Get assistance and platform documentation' };
    return { title: title || 'Dashboard', subtitle: subtitle || 'FinTrack Edu Platform' };
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getPageTitles();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={pageTitle}
          subtitle={pageSubtitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <NotificationPanel />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
