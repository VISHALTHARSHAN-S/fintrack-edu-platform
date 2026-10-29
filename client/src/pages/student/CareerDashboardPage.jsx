import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import Badge from '../../components/common/Badge';
import CareerNav from '../../components/student/CareerNav';
import { EmptyState, ErrorState, LoadingState } from '../../components/student/CareerStates';
import { fetchCareerDashboard } from '../../services/careerService';

const CareerDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setData(await fetchCareerDashboard()); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  if (loading) return <LoadingState label="Loading your career dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const { summary, recommendedJobs, upcomingInterviews, skillGaps } = data;
  return (
    <div className="space-y-6 pb-10">
      <CareerNav />
      <section className="rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
        <Badge variant="brand">Career & Jobs</Badge>
        <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Find your next opportunity</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Explore current roles matched against your profile, assessed tracker skills, Skill Passport projects, and certificates.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Applications" value={summary.totalApplications} />
          <Stat label="Under review" value={summary.underReview} />
          <Stat label="Shortlisted" value={summary.shortlisted} />
          <Stat label="Selected" value={summary.selected} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2 sm:p-6">
          <Header title="Recommended jobs" link="/student/career/jobs" linkText="Explore jobs" />
          {recommendedJobs.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendedJobs.map((job) => <JobCard key={job.jobId} job={job} />)}
            </div>
          ) : <EmptyState title="No open jobs yet" message="New jobs will appear here when recruiters publish them." />}
        </div>
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <Header title="Skill gaps" link="/student/skills" linkText="Skill tracker" />
            {skillGaps.length ? (
              <ul className="mt-3 space-y-3">
                {skillGaps.slice(0, 5).map((skill) => (
                  <li key={skill.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-slate-700">{skill.name}</span>
                    <Badge variant={skill.assessed ? 'warning' : 'slate'}>{skill.assessed ? `${skill.score}%` : 'Not assessed'}</Badge>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-slate-500">No current skill gaps to show.</p>}
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <Header title="Upcoming interviews" link="/student/career/interviews" linkText="View all" />
            {upcomingInterviews.length ? (
              <div className="mt-3 space-y-3">
                {upcomingInterviews.slice(0, 3).map((interview) => (
                  <div key={interview.interviewId} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-bold text-slate-800">{interview.jobTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(interview.date).toLocaleString()} · {interview.timeSlot}</p>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">No scheduled interviews.</p>}
          </section>
        </div>
      </section>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs text-slate-300">{label}</p><p className="mt-1 text-2xl font-extrabold">{value}</p>
  </div>
);

const Header = ({ title, link, linkText }) => (
  <div className="flex items-center justify-between gap-3">
    <h3 className="font-bold text-slate-900">{title}</h3>
    <Link className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900" to={link}>{linkText}<ArrowRight className="h-3.5 w-3.5" /></Link>
  </div>
);

export const JobCard = ({ job }) => (
  <article className="rounded-2xl border border-slate-100 p-4 transition-shadow hover:shadow-sm">
    <div className="flex items-start justify-between gap-2">
      <div>
        <h4 className="font-bold text-slate-900">{job.title}</h4>
        <p className="mt-1 text-sm text-slate-500">{job.company}</p>
      </div>
      <Badge variant="brand">{job.match.matchPercentage === null ? 'No skill data' : `${job.match.matchPercentage}% skills`}</Badge>
    </div>
    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{job.location} · {job.employmentType}</p>
    <p className="mt-2 text-xs text-slate-500">{job.match.matchedSkills.length} required skill{job.match.matchedSkills.length === 1 ? '' : 's'} matched · {job.match.missingSkills.length} to build</p>
    <Link className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900" to={`/student/career/jobs/${encodeURIComponent(job.jobId)}`}>View details <ArrowRight className="h-4 w-4" /></Link>
  </article>
);

export default CareerDashboardPage;
