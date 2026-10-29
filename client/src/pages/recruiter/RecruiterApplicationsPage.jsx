import React, { useCallback, useEffect, useState } from 'react';
import { CalendarClock, ExternalLink, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import Input from '../../components/common/Input';
import { createRecruiterInterview, fetchRecruiterApplications, updateRecruiterApplicationStatus } from '../../services/recruiterApplicationService';

const nextStatuses = {
  APPLIED: ['SCREENING', 'REJECTED'],
  SCREENING: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['SELECTED', 'REJECTED'],
  INTERVIEW: ['SELECTED', 'REJECTED'],
  SELECTED: [],
  REJECTED: [],
};
const interviewTypes = ['Technical Screening', 'Coding Assessment Review', 'System Design Round', 'HR Final Round'];
const localDateTime = (date) => {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 16);
};

const RecruiterApplicationsPage = () => {
  const [searchParams] = useSearchParams();
  const jobFilter = searchParams.get('jobId') || '';
  const applicationFilter = searchParams.get('applicationId') || '';
  const candidateFilter = searchParams.get('candidateId') || '';
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [schedulingApplication, setSchedulingApplication] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: localDateTime(new Date(Date.now() + 60 * 60 * 1000)),
    timeSlot: '',
    interviewType: interviewTypes[0],
    durationMinutes: 45,
    meetingLink: '',
    notes: '',
  });
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRecruiterApplications();
      setApplications(data);
      const selectedApplication = data.find((item) =>
        item.applicationId === applicationFilter && ['SHORTLISTED', 'INTERVIEW'].includes(item.status)
      );
      if (selectedApplication) setSchedulingApplication(selectedApplication);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  }, [applicationFilter]);

  useEffect(() => { load(); }, [load]);

  const visible = applications.filter((application) =>
    (!jobFilter || application.jobId === jobFilter) &&
    (!candidateFilter || application.candidateId === candidateFilter) &&
    (!statusFilter || application.status === statusFilter) &&
    (!search || `${application.candidateName} ${application.jobTitle} ${application.company}`.toLowerCase().includes(search.toLowerCase()))
  );

  const changeStatus = async (application, status) => {
    setBusyId(application.applicationId);
    setError('');
    try {
      const updated = await updateRecruiterApplicationStatus(application.applicationId, status);
      setApplications((current) => current.map((item) => item.applicationId === updated.applicationId ? updated : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to update application status.');
    } finally {
      setBusyId('');
    }
  };

  const scheduleInterview = async (event) => {
    event.preventDefault();
    if (!schedulingApplication) return;
    setScheduling(true);
    setError('');
    try {
      await createRecruiterInterview({
        ...scheduleForm,
        date: new Date(scheduleForm.date).toISOString(),
        applicationId: schedulingApplication.applicationId,
      });
      setSchedulingApplication(null);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to schedule the interview.');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Recruitment pipeline</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Job applications</h1>
        <p className="mt-1 text-sm text-slate-500">Review applicants for your jobs and update their application status.</p>
      </header>
      <section className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2">
        <Input name="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidates or jobs" icon={Search} />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100">
          <option value="">All statuses</option>
          {Object.keys(nextStatuses).map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </section>
      {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div> : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="font-bold text-slate-900">No applications found</h2>
          <p className="mt-1 text-sm text-slate-500">Applications for your job postings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((application) => (
            <article key={application.applicationId} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{application.candidateName}</h2>
                    <Badge variant={application.status === 'REJECTED' ? 'error' : application.status === 'SELECTED' ? 'success' : 'info'}>{application.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{application.jobTitle} · {application.company}</p>
                  <p className="mt-1 text-xs text-slate-500">Applied {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'date unavailable'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(application.matchedSkills || []).map((skill) => <Badge key={`matched-${skill}`} variant="success">Matched: {skill}</Badge>)}
                    {(application.missingSkills || []).map((skill) => <Badge key={`missing-${skill}`} variant="slate">Gap: {skill}</Badge>)}
                    {application.skillMatchPercentage != null && <Badge variant="brand">{application.skillMatchPercentage}% required-skill match</Badge>}
                  </div>
                  {application.coverMessage && <p className="mt-3 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{application.coverMessage}</p>}
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <a className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" href={application.resumeUrl} target="_blank" rel="noreferrer">
                    Resume <ExternalLink className="h-4 w-4" />
                  </a>
                  <select
                    value={application.status}
                    disabled={busyId === application.applicationId || !(nextStatuses[application.status] || []).length}
                    onChange={(event) => changeStatus(application, event.target.value)}
                    aria-label={`Update status for ${application.candidateName}`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    <option value={application.status}>{application.status}</option>
                    {(nextStatuses[application.status] || []).map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  {['SHORTLISTED', 'INTERVIEW'].includes(application.status) && <Button size="sm" icon={CalendarClock} onClick={() => setSchedulingApplication(application)}>Schedule interview</Button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {schedulingApplication && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <form onSubmit={scheduleInterview} className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="schedule-interview-title">
            <div className="flex items-start justify-between gap-3">
              <div><h2 id="schedule-interview-title" className="text-xl font-bold text-slate-900">Schedule interview</h2><p className="mt-1 text-sm text-slate-500">{schedulingApplication.candidateName} · {schedulingApplication.jobTitle}</p></div>
              <button type="button" aria-label="Close dialog" onClick={() => setSchedulingApplication(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">Date and time<input required type="datetime-local" min={localDateTime(new Date())} value={scheduleForm.date} onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Interview round<select value={scheduleForm.interviewType} onChange={(event) => setScheduleForm((current) => ({ ...current, interviewType: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm">{interviewTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Duration (minutes)<input required type="number" min="15" max="240" step="1" value={scheduleForm.durationMinutes} onChange={(event) => setScheduleForm((current) => ({ ...current, durationMinutes: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label>
            </div>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">Time slot<input required maxLength="100" value={scheduleForm.timeSlot} onChange={(event) => setScheduleForm((current) => ({ ...current, timeSlot: event.target.value }))} placeholder="10:00 AM - 10:45 AM IST" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">Meeting link<input type="url" maxLength="500" value={scheduleForm.meetingLink} onChange={(event) => setScheduleForm((current) => ({ ...current, meetingLink: event.target.value }))} placeholder="https://..." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">Instructions<textarea maxLength="2000" rows="3" value={scheduleForm.notes} onChange={(event) => setScheduleForm((current) => ({ ...current, notes: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" /></label>
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setSchedulingApplication(null)}>Cancel</Button><Button type="submit" disabled={scheduling}>{scheduling ? 'Scheduling...' : 'Schedule interview'}</Button></div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplicationsPage;
