import React, { useEffect, useState } from 'react';
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, Edit3, MapPin, Users } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Toast from '../../components/common/Toast';
import { fetchRecruiterJob, updateRecruiterJob } from '../../services/recruiterJobService';

const statusVariant = { DRAFT: 'warning', ACTIVE: 'success', CLOSED: 'slate' };
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set';

const RecruiterJobDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(location.state?.success || '');

  const loadJob = async () => {
    setIsLoading(true);
    try { setJob(await fetchRecruiterJob(jobId)); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load this job.'); } finally { setIsLoading(false); }
  };
  useEffect(() => { loadJob(); }, [jobId]);

  const handleStatusChange = async () => {
    setIsUpdating(true);
    try { await updateRecruiterJob(jobId, { status: confirmAction }); setConfirmAction(''); setSuccess(`Job ${confirmAction === 'ACTIVE' ? 'published' : 'closed'} successfully.`); await loadJob(); } catch (requestError) { console.error('Failed to update recruiter job status:', requestError); setError(requestError.response?.data?.message || 'Unable to update the job status.'); } finally { setIsUpdating(false); }
  };

  if (isLoading) return <div className="space-y-5"><CardSkeleton /><CardSkeleton /></div>;
  if (!job) return <div className="rounded-3xl border border-red-100 bg-white p-10 text-center"><p className="font-semibold text-red-700">{error || 'Job not found.'}</p><Button className="mt-5" onClick={() => navigate('/recruiter/jobs')}>Back to Jobs</Button></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/recruiter/jobs')}>Back to Jobs</Button>
      {error && <Toast type="error" message={error} onClose={() => setError('')} duration={0} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} />}
      <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 p-6 text-white shadow-xl sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="mb-3 flex items-center gap-2 text-brand-200"><Briefcase className="h-5 w-5" /><span className="text-sm font-semibold">{job.company}</span></div><h1 className="text-2xl font-extrabold sm:text-3xl">{job.title}</h1><div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300"><span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location} · {job.workMode}</span><span>{job.employmentType}</span><span>{job.experienceLevel}</span></div></div><Badge variant={statusVariant[job.status] || 'slate'}>{job.status}</Badge></div></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6"><DetailSection title="About the role"><p className="whitespace-pre-line text-sm leading-7 text-slate-600">{job.description}</p></DetailSection><DetailSection title="Required skills"><SkillList items={job.requiredSkills} /></DetailSection><DetailSection title="Preferred skills"><SkillList items={job.preferredSkills} /></DetailSection><div className="grid gap-6 sm:grid-cols-2"><DetailSection title="Responsibilities"><BulletList items={job.responsibilities} /></DetailSection><DetailSection title="Requirements"><BulletList items={job.requirements} /></DetailSection></div></div>
        <aside className="h-fit space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Salary range</p><p className="mt-1 font-bold text-slate-900">{job.salaryRange}</p></div><div className="border-t border-slate-100 pt-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applicants</p><p className="mt-1 flex items-center gap-2 text-xl font-extrabold text-slate-900"><Users className="h-5 w-5 text-brand-600" />{job.applicantsCount ?? job.applicants ?? 0}</p></div><div className="border-t border-slate-100 pt-4"><p className="flex items-center gap-2 text-xs text-slate-500"><Calendar className="h-4 w-4" />Deadline {formatDate(job.applicationDeadline)}</p><p className="mt-2 text-xs text-slate-500">Posted {formatDate(job.postedAt)}</p></div><div className="space-y-2 border-t border-slate-100 pt-4"><Button fullWidth variant="secondary" icon={Edit3} onClick={() => navigate(`/recruiter/jobs/${job.jobId}/edit`)}>Edit Job</Button>{job.status === 'DRAFT' && <Button fullWidth onClick={() => setConfirmAction('ACTIVE')}>Publish Job</Button>}{job.status === 'ACTIVE' && <Button fullWidth variant="danger" onClick={() => setConfirmAction('CLOSED')}>Close Job</Button>}<Button fullWidth variant="ghost" onClick={() => navigate(`/recruiter/applications?jobId=${job.jobId}`)}>View Applicants</Button></div></aside>
      </div>
      <ConfirmDialog isOpen={Boolean(confirmAction)} onClose={() => setConfirmAction('')} onConfirm={handleStatusChange} isLoading={isUpdating} title={confirmAction === 'ACTIVE' ? 'Publish this job?' : 'Close this job?'} message={confirmAction === 'ACTIVE' ? 'This job will become visible to candidates as an active opportunity.' : 'This job will be closed and will no longer accept new applications.'} confirmText={confirmAction === 'ACTIVE' ? 'Publish Job' : 'Close Job'} isDanger={confirmAction === 'CLOSED'} />
    </div>
  );
};

const DetailSection = ({ title, children }) => <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-3 text-base font-bold text-slate-900">{title}</h2>{children}</section>;
const SkillList = ({ items = [] }) => <div className="flex flex-wrap gap-2">{items.length ? items.map((skill) => <Badge key={skill} variant="brand">{skill}</Badge>) : <span className="text-sm text-slate-500">None specified</span>}</div>;
const BulletList = ({ items = [] }) => <ul className="space-y-2 text-sm leading-6 text-slate-600">{items.length ? items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>) : <li>None specified</li>}</ul>;

export default RecruiterJobDetailsPage;
