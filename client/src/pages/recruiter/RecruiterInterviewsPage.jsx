import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Check, ExternalLink, X } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import { fetchRecruiterInterviews, updateRecruiterInterview } from '../../services/recruiterApplicationService';

const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setInterviews(await fetchRecruiterInterviews());
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load interviews.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (interview, status) => {
    setBusyId(interview.interviewId);
    setError('');
    try {
      const updated = await updateRecruiterInterview(interview.interviewId, { status });
      setInterviews((current) => current.map((item) => item.interviewId === updated.interviewId ? updated : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to update the interview.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Recruitment pipeline</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Interview schedule</h1>
        <p className="mt-1 text-sm text-slate-500">Manage interviews scheduled with candidates who applied to your jobs.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div> : interviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="font-bold text-slate-900">No interviews scheduled</h2>
          <p className="mt-1 text-sm text-slate-500">Shortlist an applicant, then schedule their interview from the applications page.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {interviews.map((interview) => (
            <article key={interview.interviewId} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><Badge variant={interview.status === 'SCHEDULED' ? 'success' : interview.status === 'CANCELLED' ? 'error' : 'slate'}>{interview.status}</Badge><h2 className="mt-2 text-lg font-bold text-slate-900">{interview.candidateName}</h2><p className="text-sm text-slate-500">{interview.jobTitle} · {interview.company || 'Company not available'}</p></div>
                <CalendarDays className="h-5 w-5 text-brand-700" />
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p>{new Date(interview.date).toLocaleString()} · {interview.timeSlot}</p>
                <p>{interview.interviewType} · {interview.durationMinutes} minutes</p>
              </div>
              {interview.notes && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{interview.notes}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {interview.meetingLink && <a className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700" href={interview.meetingLink} target="_blank" rel="noreferrer">Meeting link <ExternalLink className="h-4 w-4" /></a>}
                {interview.status === 'SCHEDULED' && <>
                  <Button size="sm" variant="secondary" icon={Check} disabled={busyId === interview.interviewId} onClick={() => updateStatus(interview, 'COMPLETED')}>Mark completed</Button>
                  <Button size="sm" variant="danger" icon={X} disabled={busyId === interview.interviewId} onClick={() => updateStatus(interview, 'CANCELLED')}>Cancel</Button>
                </>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviewsPage;
