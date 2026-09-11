import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Calendar, ChevronRight, Edit3, Filter, MapPin, Plus, Search, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import { fetchRecruiterJobs, updateRecruiterJob } from '../../services/recruiterJobService';

const statusVariant = { DRAFT: 'warning', ACTIVE: 'success', CLOSED: 'slate' };
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set';

const RecruiterJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', workMode: '', employmentType: '', experienceLevel: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmJob, setConfirmJob] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadJobs = async () => {
    setIsLoading(true);
    const result = await fetchRecruiterJobs();
    setJobs(result.jobs);
    setError(result.usingFallback ? 'Jobs API is unavailable. Showing demo data; changes require a live API.' : '');
    setIsLoading(false);
  };

  useEffect(() => { loadJobs(); }, []);

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const search = filters.search.toLowerCase();
    return (!search || `${job.title} ${job.company}`.toLowerCase().includes(search))
      && (!filters.status || job.status === filters.status)
      && (!filters.workMode || job.workMode === filters.workMode)
      && (!filters.employmentType || job.employmentType === filters.employmentType)
      && (!filters.experienceLevel || job.experienceLevel === filters.experienceLevel);
  }), [filters, jobs]);

  const clearFilters = () => setFilters({ search: '', status: '', workMode: '', employmentType: '', experienceLevel: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      await updateRecruiterJob(confirmJob.jobId, { status: confirmJob.action });
      setConfirmJob(null);
      setSuccess(`Job ${confirmJob.action === 'ACTIVE' ? 'published' : 'closed'} successfully.`);
      await loadJobs();
    } catch (requestError) {
      console.error('Failed to update recruiter job status:', requestError);
      setError(requestError.response?.data?.message || 'Unable to update the job status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Recruiter workspace</p>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Job management</h1>
          <p className="mt-1 text-sm text-slate-500">Create, publish, and manage every hiring opportunity from one place.</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/recruiter/jobs/new')}>Create Job</Button>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} duration={0} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Filter className="h-4 w-4 text-brand-600" /> Search and filter jobs</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Input name="search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search title or company" icon={Search} />
          <Select name="status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} options={['DRAFT', 'ACTIVE', 'CLOSED'].map((value) => ({ value, label: value }))} />
          <Select name="workMode" value={filters.workMode} onChange={(event) => setFilters({ ...filters, workMode: event.target.value })} options={['On-site', 'Hybrid', 'Remote'].map((value) => ({ value, label: value }))} />
          <Select name="employmentType" value={filters.employmentType} onChange={(event) => setFilters({ ...filters, employmentType: event.target.value })} options={['Full-time', 'Part-time', 'Internship'].map((value) => ({ value, label: value }))} />
          <Select name="experienceLevel" value={filters.experienceLevel} onChange={(event) => setFilters({ ...filters, experienceLevel: event.target.value })} options={[...new Set(jobs.map((job) => job.experienceLevel).filter(Boolean))].map((value) => ({ value, label: value }))} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500"><span className="font-bold text-slate-900">{filteredJobs.length}</span> matching {filteredJobs.length === 1 ? 'job' : 'jobs'}</p>
          {hasFilters && <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Clear Filters</Button>}
        </div>
      </div>

      {isLoading ? <div className="space-y-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div> : filteredJobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><Briefcase className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 text-lg font-bold text-slate-900">No jobs match these filters</h2><p className="mt-1 text-sm text-slate-500">Clear the filters or create a new opportunity to get started.</p><Button className="mt-5" variant="secondary" onClick={hasFilters ? clearFilters : () => navigate('/recruiter/jobs/new')}>{hasFilters ? 'Clear Filters' : 'Create Job'}</Button></div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredJobs.map((job) => <JobCard key={job.jobId} job={job} onView={() => navigate(`/recruiter/jobs/${job.jobId}`)} onEdit={() => navigate(`/recruiter/jobs/${job.jobId}/edit`)} onStatusChange={(action) => setConfirmJob({ ...job, action })} />)}
        </div>
      )}

      <ConfirmDialog isOpen={Boolean(confirmJob)} onClose={() => setConfirmJob(null)} onConfirm={handleStatusChange} isLoading={isUpdating} title={confirmJob?.action === 'ACTIVE' ? 'Publish this job?' : 'Close this job?'} message={confirmJob?.action === 'ACTIVE' ? 'This job will become visible to candidates as an active opportunity.' : 'This job will be closed and will no longer accept new applications.'} confirmText={confirmJob?.action === 'ACTIVE' ? 'Publish Job' : 'Close Job'} isDanger={confirmJob?.action === 'CLOSED'} />
    </div>
  );
};

const JobCard = ({ job, onView, onEdit, onStatusChange }) => (
  <article className="flex min-h-[270px] flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-card-hover sm:p-6">
    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Briefcase className="h-5 w-5" /></div><div className="min-w-0"><h2 className="truncate text-base font-bold text-slate-900">{job.title}</h2><p className="mt-0.5 truncate text-sm text-slate-500">{job.company}</p></div></div><Badge variant={statusVariant[job.status] || 'slate'}>{job.status}</Badge></div>
    <div className="mt-5 grid grid-cols-2 gap-y-3 text-xs text-slate-500"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{job.location} · {job.workMode}</span><span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" />{job.applicantsCount ?? job.applicants ?? 0} applicants</span><span>{job.employmentType} · {job.experienceLevel}</span><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />Posted {formatDate(job.postedAt)}</span></div>
    <p className="mt-4 line-clamp-2 text-sm font-semibold text-slate-700">{job.salaryRange}</p>
    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4"><Button variant="ghost" size="sm" icon={ChevronRight} onClick={onView}>View</Button><Button variant="secondary" size="sm" icon={Edit3} onClick={onEdit}>Edit</Button>{job.status === 'DRAFT' && <Button variant="primary" size="sm" onClick={() => onStatusChange('ACTIVE')}>Publish</Button>}{job.status === 'ACTIVE' && <Button variant="danger" size="sm" onClick={() => onStatusChange('CLOSED')}>Close</Button>}</div>
  </article>
);

export default RecruiterJobsPage;
