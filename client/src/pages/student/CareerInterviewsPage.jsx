import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock3, ExternalLink, Video } from 'lucide-react';
import Badge from '../../components/common/Badge';
import CareerNav from '../../components/student/CareerNav';
import { EmptyState, ErrorState, LoadingState } from '../../components/student/CareerStates';
import { fetchStudentInterviews } from '../../services/careerService';

const CareerInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setInterviews(await fetchStudentInterviews()); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6 pb-10">
      <CareerNav />
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-bold text-slate-900">Interview schedule</h2>
        <p className="mt-1 text-sm text-slate-500">Interview details and meeting instructions shared by recruiters.</p>
      </section>
      {loading ? <LoadingState label="Loading interviews..." /> : error ? <ErrorState message={error} onRetry={load} /> : interviews.length === 0 ? (
        <EmptyState title="No interviews scheduled" message="Interview invitations for your applications will be listed here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {interviews.map((interview) => (
            <article key={interview.interviewId} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div><Badge variant={interview.status === 'SCHEDULED' ? 'success' : interview.status === 'CANCELLED' ? 'error' : 'slate'}>{interview.status}</Badge><h3 className="mt-2 text-lg font-bold text-slate-900">{interview.jobTitle}</h3><p className="text-sm text-slate-500">{interview.company || interview.recruiterName}</p></div>
                <Video className="h-5 w-5 text-brand-700" />
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" />{new Date(interview.date).toLocaleDateString()}</p>
                <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-400" />{interview.timeSlot} · {interview.durationMinutes} minutes</p>
                <p><strong className="text-slate-700">Round:</strong> {interview.interviewType}</p>
              </div>
              {interview.notes && <div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Instructions</p><p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">{interview.notes}</p></div>}
              {interview.status === 'SCHEDULED' && interview.meetingLink && (
                <a className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-brand-600" href={interview.meetingLink} target="_blank" rel="noreferrer">Join interview <ExternalLink className="h-4 w-4" /></a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareerInterviewsPage;
