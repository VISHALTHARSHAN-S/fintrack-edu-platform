import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Code2,
  BrainCircuit,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Globe,
  Lock,
} from 'lucide-react';
import Button from '../../components/common/Button';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeEcoTab, setActiveEcoTab] = useState('students');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. NAVIGATION HEADER */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xl tracking-tight">FinTrack</span>
              <span className="font-bold text-brand-600 text-xl tracking-tight">Edu</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#overview" className="hover:text-brand-600 transition-colors">Overview</a>
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#ecosystem" className="hover:text-brand-600 transition-colors">Ecosystem</a>
            <a href="#skills" className="hover:text-brand-600 transition-colors">Skill Passport</a>
            <a href="#career" className="hover:text-brand-600 transition-colors">Career Hub</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-brand-50/40 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Naan Mudhalvan Aligned Industry-Led FinTech Platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Learn FinTech Skills. <br />
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-purple bg-clip-text text-transparent">
                Build Industry-Ready Careers.
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Learn, practice, connect with industry mentors, build verified skills and prepare for your FinTech career in one comprehensive platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto shadow-lg shadow-brand-500/25"
              >
                Get Started
              </Button>
              <a href="#overview" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Platform
                </Button>
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-200/60 mt-10 text-left">
              <div>
                <p className="text-2xl font-bold text-slate-900">10,000+</p>
                <p className="text-xs text-slate-500 font-medium">Students Skilled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">150+</p>
                <p className="text-xs text-slate-500 font-medium">Industry Mentors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">80+</p>
                <p className="text-xs text-slate-500 font-medium">FinTech Recruiters</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">94%</p>
                <p className="text-xs text-slate-500 font-medium">Placement Readiness</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM OVERVIEW */}
      <section id="overview" className="py-16 md:py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Three Core Pillars</h2>
            <p className="text-3xl font-bold text-slate-900">Connected Ecosystem for FinTech Growth</p>
            <p className="text-slate-500 text-sm mt-3">Bridging academia and the modern financial technology workforce seamlessly.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all hover:shadow-xl hover:shadow-brand-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">STUDENTS</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Learning + Practice + Mentoring + Skills + Career. Master quantitative finance, algorithmic trading, and DeFi protocols.
              </p>
              <span className="text-brand-600 text-xs font-semibold inline-flex items-center gap-1">
                Explore Student Path <ChevronRight className="w-4 h-4" />
              </span>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all hover:shadow-xl hover:shadow-brand-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">MENTORS</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Guidance + Live Classes + Student Support. Share real-world market expertise with the next generation of engineers.
              </p>
              <span className="text-purple-600 text-xs font-semibold inline-flex items-center gap-1">
                Join as Mentor <ChevronRight className="w-4 h-4" />
              </span>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all hover:shadow-xl hover:shadow-brand-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">RECRUITERS</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Candidates + Skills + Jobs + Placement. Source candidates with verified skill passports and audited coding abilities.
              </p>
              <span className="text-indigo-600 text-xs font-semibold inline-flex items-center gap-1">
                Access Talent Pool <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES GRID */}
      <section id="features" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Industry Curriculum</h2>
            <p className="text-3xl font-bold text-slate-900">Cutting-Edge FinTech Modules</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Algorithmic Trading', desc: 'Build and backtest high-frequency trading bots using Python and C++.' },
              { icon: BrainCircuit, title: 'Financial Data Analytics', desc: 'Apply machine learning models to forecast risk and market volatility.' },
              { icon: ShieldCheck, title: 'Risk & RegTech Engine', desc: 'Understand anti-money laundering protocols and automated compliance.' },
              { icon: Lock, title: 'Blockchain & DeFi', desc: 'Audit smart contracts and design decentralized liquidity pools.' },
              { icon: Code2, title: 'Financial Sandbox', desc: 'Interactive live coding environment with automated financial test cases.' },
              { icon: Award, title: 'Naan Mudhalvan Badges', desc: 'State-recognized skill passports verified on immutable ledgers.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-base mb-2">{f.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Progressive Learning</h2>
            <p className="text-3xl font-bold text-slate-900">How FinTrack Edu Works</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              { step: '01', title: 'Register Account', desc: 'Choose your role as Student, Mentor, or Recruiter.' },
              { step: '02', title: 'Interactive Learning', desc: 'Enroll in live classes and practice quant modules.' },
              { step: '03', title: 'Verify Skill Passport', desc: 'Complete assessments to earn Naan Mudhalvan badges.' },
              { step: '04', title: 'Career & Placement', desc: 'Get recruited directly by leading FinTech organizations.' },
            ].map((s, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-3xl font-extrabold text-brand-300 block mb-2">{s.step}</span>
                <h4 className="font-bold text-slate-900 text-base mb-2">{s.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Elevate Your FinTech Journey?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Join thousands of students, industry mentors, and top recruiters on Tamil Nadu's leading FinTech skill platform.</p>
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
              Create Free Account
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-3">
              <Sparkles className="w-5 h-5 text-brand-400" /> FinTrack Edu
            </div>
            <p className="text-slate-500 leading-relaxed">Naan Mudhalvan aligned Industry-Led FinTech Skill Development Platform.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">For Students</p>
            <ul className="space-y-2">
              <li><Link to="/register" className="hover:text-white">Explore Skill Passport</Link></li>
              <li><Link to="/login" className="hover:text-white">Live Classes</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">For Industry</p>
            <ul className="space-y-2">
              <li><Link to="/register" className="hover:text-white">Mentor Registration</Link></li>
              <li><Link to="/register" className="hover:text-white">Recruiter Talent Pool</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Legal & Support</p>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 border-t border-slate-900 pt-6 text-center text-slate-500">
          © {new Date().getFullYear()} FinTrack Edu Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
