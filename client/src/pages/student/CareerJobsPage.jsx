import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import CareerNav from '../../components/student/CareerNav';
import { EmptyState, ErrorState, LoadingState } from '../../components/student/CareerStates';
import { fetchStudentJobs } from '../../services/careerService';

const initialFilters = { search: '', company: '', location: '', skill: '', jobType: '', eligible: false };

const CareerJobsPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== false));
      setJobs(await fetchStudentJobs(params));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  const update = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  return (
    <div className="space-y-6 pb-10">
      <CareerNav />
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-brand-700" />
          <div><h2 className="font-bold text-slate-900">Find jobs</h2><p className="text-sm text-slate-500">Search open roles by title, company, location, and required skill.</p></div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Filter label="Search" value={filters.search} onChange={update('search')} placeholder="Title or keywords" />
          <Filter label="Company" value={filters.company} onChange={update('company')} placeholder="Company name" />
          <Filter label="Location" value={filters.location} onChange={update('location')} placeholder="City or remote" />
          <Filter label="Required skill" value={filters.skill} onChange={update('skill')} placeholder="e.g. SQL" />
          <Select label="Job type" name="jobType" value={filters.jobType} onChange={update('jobType')} placeholder="All job types" options={['Full-time', 'Part-time', 'Internship'].map((value) => ({ value, label: value }))} />
          <label className="flex items-center gap-2 self-end rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={filters.eligible} onChange={update('eligible')} className="rounded border-slate-300 text-brand-700 focus:ring-brand-500" />
            Show only roles matching all required skills
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Skill matching uses career-profile skills, assessed tracker results, Skill Passport projects, and certificates. Unassessed skills are not assumed.</p>
          <Button variant="ghost" size="sm" onClick={() => setFilters(initialFilters)}>Clear filters</Button>
        </div>
      </section>

      {loading ? <LoadingState label="Loading open jobs..." /> : error ? <ErrorState message={error} onRetry={load} /> : jobs.length === 0 ? (
        <EmptyState title="No jobs match your search" message="Try adjusting the filters or check back when recruiters post new roles." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <article key={job.jobId} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div><Badge variant="brand">{job.employmentType}</Badge><h3 className="mt-2 text-lg font-bold text-slate-900">{job.title}</h3><p className="mt-1 text-sm text-slate-500">{job.company}</p></div>
                <Badge variant={job.match.matchPercentage === null ? 'slate' : job.match.missingSkills.length === 0 ? 'success' : 'warning'}>
                  {job.match.matchPercentage === null ? 'No skill data' : `${job.match.matchPercentage}% required skills`}
                </Badge>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{job.location}</span><span>·</span><span>{job.workMode}</span>
                {job.salaryRange && <><span>·</span><span>{job.salaryRange}</span></>}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {job.match.matchedSkills.slice(0, 4).map((skill) => <Badge key={skill} variant="success">{skill}</Badge>)}
                {job.match.missingSkills.slice(0, 3).map((skill) => <Badge key={skill} variant="warning">Build: {skill}</Badge>)}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">Apply by {new Date(job.applicationDeadline).toLocaleDateString()}</p>
                <Link to={`/student/career/jobs/${encodeURIComponent(job.jobId)}`} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-brand-600">View job</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

const Filter = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
    <div className="relative">
      {label === 'Search' && <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
      <input value={value} onChange={onChange} placeholder={placeholder} className={`w-full rounded-xl border border-slate-200 py-2.5 pr-3 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100 ${label === 'Search' ? 'pl-9' : 'pl-3'}`} />
    </div>
  </label>
);

export default CareerJobsPage;
