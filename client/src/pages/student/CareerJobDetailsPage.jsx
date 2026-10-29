import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, MapPin, Send, XCircle } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CareerNav from '../../components/student/CareerNav';
import { ErrorState, LoadingState } from '../../components/student/CareerStates';
import { applyForStudentJob, fetchStudentJob } from '../../services/careerService';

const CareerJobDetailsPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverMessage, setCoverMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [applying, setApplying] = useState(false);
  const statusLabel = { APPLIED: 'Applied', SCREENING: 'Under Review', SHORTLISTED: 'Shortlisted', INTERVIEW: 'Interview', SELECTED: 'Selected', REJECTED: 'Rejected' };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setJob(await fetchStudentJob(jobId)); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [jobId]);
  useEffect(() => { load(); }, [load]);

  const apply = async () => {
    setApplying(true); setActionError(''); setActionSuccess('');
    try {
      const result = await applyForStudentJob(job.jobId, { coverMessage });
      setActionSuccess('Your application was submitted.');
      setJob((current) => ({ ...current, application: { applicationId: result.applicationId, status: 'APPLIED' } }));
    } catch (err) { setActionError(err.message); } finally { setApplying(false); }
  };

  if (loading) return <LoadingState label="Loading job details..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6 pb-10">
      <CareerNav />
      <Link to="/student/career/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link>
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
          <div className="max-w-3xl">
            <Badge variant="brand">{job.employmentType}</Badge>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">{job.title}</h1>
            <p className="mt-2 text-lg font-semibold text-slate-600">{job.company}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location} · {job.workMode}</span>
              <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4" />{job.experienceLevel}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Deadline {new Date(job.applicationDeadline).toLocaleDateString()}</span>
            </div>
            {job.salaryRange && <p className="mt-3 text-sm font-semibold text-slate-700">{job.salaryRange}</p>}
          </div>
          <div className="h-fit min-w-56 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your skill match</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{job.match.matchPercentage === null ? '—' : `${job.match.matchPercentage}%`}</p>
            <p className="mt-1 text-xs text-slate-500">{job.match.matchedSkills.length} of {job.match.requiredSkills.length} required skills match</p>
          </div>
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_21rem]">
          <div className="space-y-6">
            <DetailSection title="About this role"><p className="whitespace-pre-line text-sm leading-7 text-slate-600">{job.description}</p></DetailSection>
            <DetailSection title="Responsibilities"><BulletList items={job.responsibilities} /></DetailSection>
            <DetailSection title="Requirements"><BulletList items={job.requirements} /></DetailSection>
            <DetailSection title="Skills required">
              <div className="flex flex-wrap gap-2">{job.match.requiredSkills.map((skill) => <Badge key={skill} variant={job.match.matchedSkills.includes(skill) ? 'success' : 'warning'}>{skill}</Badge>)}</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SkillList title="Matching skills" skills={job.match.matchedSkills} icon={CheckCircle2} />
                <SkillList title="Skills to build" skills={job.match.missingSkills} icon={XCircle} />
              </div>
            </DetailSection>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <h2 className="font-bold text-slate-900">Apply for this role</h2>
            {job.application ? (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                You have applied. Current status: <strong>{statusLabel[job.application.status] || job.application.status}</strong>.
                <Link to="/student/career/applications" className="mt-2 block font-semibold underline">Track application</Link>
              </div>
            ) : !job.isOpen ? (
              <p className="mt-3 text-sm text-slate-600">Applications are closed for this position.</p>
            ) : (
              <>
                <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="coverMessage">Message to recruiter <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea id="coverMessage" value={coverMessage} onChange={(event) => setCoverMessage(event.target.value)} maxLength={3000} rows={5} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="Briefly explain your interest in this role." />
                <p className="mt-1 text-right text-xs text-slate-400">{coverMessage.length}/3000</p>
                {actionError && <p role="alert" className="mt-3 text-sm text-red-700">{actionError}</p>}
                {actionSuccess && <p role="status" className="mt-3 text-sm text-emerald-700">{actionSuccess}</p>}
                <Button className="mt-4 w-full" icon={Send} isLoading={applying} onClick={apply}>Submit application</Button>
                <p className="mt-3 text-xs leading-5 text-slate-500">Your application includes the resume URL saved in your career profile. <Link className="font-semibold text-brand-700" to="/student/career/profile">Review profile</Link>.</p>
              </>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
};

const DetailSection = ({ title, children }) => (
  <section><h2 className="mb-3 text-base font-bold text-slate-900">{title}</h2>{children}</section>
);

const BulletList = ({ items = [] }) => items.length
  ? <ul className="space-y-2">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-6 text-slate-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{item}</li>)}</ul>
  : <p className="text-sm text-slate-500">No details provided.</p>;

const SkillList = ({ title, skills, icon: Icon }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600"><Icon className="h-4 w-4" />{title}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{skills.length ? skills.join(', ') : 'None recorded'}</p>
  </div>
);

export default CareerJobDetailsPage;
