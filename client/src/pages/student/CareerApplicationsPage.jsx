import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, CalendarDays, ExternalLink } from 'lucide-react';
import Badge from '../../components/common/Badge';
import CareerNav from '../../components/student/CareerNav';
import { EmptyState, ErrorState, LoadingState } from '../../components/student/CareerStates';
import { fetchStudentApplications } from '../../services/careerService';

const statusLabel = { APPLIED: 'Applied', SCREENING: 'Under Review', SHORTLISTED: 'Shortlisted', INTERVIEW: 'Interview', SELECTED: 'Selected', REJECTED: 'Rejected' };
const statusStyle = { APPLIED: 'brand', SCREENING: 'warning', SHORTLISTED: 'success', INTERVIEW: 'success', SELECTED: 'success', REJECTED: 'error' };

const CareerApplicationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await fetchStudentApplications()); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6 pb-10">
      <CareerNav />
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-bold text-slate-900">Application tracking</h2>
        <p className="mt-1 text-sm text-slate-500">Follow each application through the recruiter’s current hiring workflow.</p>
      </section>
      {loading ? <LoadingState label="Loading your applications..." /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <EmptyState title="No applications yet" message="When you apply to an open role, your application status will appear here." />
      ) : (
        <div className="space-y-3">
          {items.map((application) => (
            <article key={application.applicationId} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="rounded-xl bg-brand-50 p-2 text-brand-700"><BriefcaseBusiness className="h-5 w-5" /></div>
                  <div><h3 className="font-bold text-slate-900">{application.jobTitle}</h3><p className="mt-1 text-sm text-slate-500">{application.company}</p><p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400"><CalendarDays className="h-3.5 w-3.5" />Applied {new Date(application.appliedDate).toLocaleDateString()}</p></div>
                </div>
                <Badge variant={statusStyle[application.status] || 'slate'}>{statusLabel[application.status] || application.status}</Badge>
              </div>
              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <p className="text-xs text-slate-500">Matched required skills: <strong className="text-slate-700">{application.matchedSkills?.length ? application.matchedSkills.join(', ') : 'None recorded'}</strong></p>
                <p className="text-xs text-slate-500">Skills to build: <strong className="text-slate-700">{application.missingSkills?.length ? application.missingSkills.join(', ') : 'None'}</strong></p>
                <p className="text-xs text-slate-500">Match: <strong className="text-slate-700">{application.skillMatchPercentage === null ? 'Not available' : `${application.skillMatchPercentage}% of required skills`}</strong></p>
              </div>
              {application.resumeUrl && <a className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700" href={application.resumeUrl} target="_blank" rel="noreferrer">Resume submitted <ExternalLink className="h-3 w-3" /></a>}
            </article>
          ))}
        </div>
      )}
      <Link to="/student/career/interviews" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">View interview schedules <CalendarDays className="h-4 w-4" /></Link>
    </div>
  );
};

export default CareerApplicationsPage;
