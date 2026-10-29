import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, UserCheck, Plus, Search, ShieldCheck, Sparkles } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import API from '../../services/api';
import CardSkeleton from '../../components/common/LoadingSkeleton';

const RecruiterDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const res = await API.get('/users/recruiter/dashboard');
        setData(res.data.data);
        setError('');
      } catch (err) {
        setData(null);
        setError(err.response?.data?.message || 'Unable to load recruiter dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecruiterData();
  }, [retry]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) return (
    <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
      <p role="alert" className="text-sm text-red-700">{error || 'Recruiter dashboard data is unavailable.'}</p>
      <Button className="mt-4" variant="secondary" onClick={() => { setIsLoading(true); setRetry((current) => current + 1); }}>Try again</Button>
    </div>
  );

  const { stats, recommendedCandidates, activeJobs } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* RECRUITER WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-800 via-brand-700 to-navy-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-white backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> Recruiter Talent Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'there'}!
            </h2>
            <p className="text-indigo-100 text-sm">Source job-ready FinTech candidates verified with Naan Mudhalvan skill passports.</p>
          </div>
          <Button variant="secondary" size="md" icon={Plus} onClick={() => navigate('/recruiter/jobs/new')} className="bg-white text-indigo-900 border-white hover:bg-indigo-50 shrink-0">
            Post New Job
          </Button>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Candidates for your jobs', value: stats.availableCandidates, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Total Applications', value: stats.applications, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Shortlisted Candidates', value: stats.shortlistedCandidates, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{item.label}</span>
                <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          {/* RECOMMENDED CANDIDATES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Top Match Candidates</h3>
                <p className="text-xs text-slate-500">Applicants ranked by overlap between recorded skills and your active job requirements</p>
              </div>
              <Button variant="ghost" size="sm" icon={Search} onClick={() => navigate('/recruiter/candidates')}>
                Candidate Search
              </Button>
            </div>

            <div className="space-y-3">
              {recommendedCandidates.map((cand) => (
                <div key={cand.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand" size="sm">{cand.role}</Badge>
                      {cand.verifiedBadge === 'Not verified' ? <Badge variant="slate" size="sm">{cand.verifiedBadge}</Badge> : <Badge variant="success" size="sm"><ShieldCheck className="w-3 h-3 mr-1 inline" /> {cand.verifiedBadge}</Badge>}
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">{cand.name}</h4>
                    <p className="text-xs text-slate-500">Skill Score: <span className="font-bold text-slate-800">{cand.skillScore}</span> | {cand.match}</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => navigate(`/recruiter/candidates/${cand.candidateId}`)}>
                    View Passport
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE JOBS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Active Job Postings</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {activeJobs.map((job) => (
                <div key={job.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{job.title}</h4>
                    <p className="text-xs text-slate-500">{job.applicants} Applicants | Posted {job.posted}</p>
                  </div>
                  <Badge variant="info" size="sm">{job.status}</Badge>
                </div>
              ))}
              {activeJobs.length === 0 && <p className="py-5 text-sm text-slate-500">No active job postings yet.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Quick Recruiter Actions</h3>
            <div className="space-y-2">
              <Button variant="secondary" fullWidth className="justify-start text-xs font-semibold py-3" icon={Plus} onClick={() => navigate('/recruiter/jobs/new')}>
                Post Full-Time Job Opening
              </Button>
              <Button variant="secondary" fullWidth className="justify-start text-xs font-semibold py-3" icon={Plus} onClick={() => navigate('/recruiter/jobs/new')}>
                Post Internship Role
              </Button>
              <Button variant="secondary" fullWidth className="justify-start text-xs font-semibold py-3" icon={Search} onClick={() => navigate('/recruiter/candidates')}>
                Search Candidates Database
              </Button>
              <Button variant="secondary" fullWidth className="justify-start text-xs font-semibold py-3" icon={ShieldCheck} onClick={() => navigate('/recruiter/candidates')}>
                View Skill Passports Audit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
