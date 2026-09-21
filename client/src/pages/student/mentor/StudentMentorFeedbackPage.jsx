import React, { useEffect, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import CardSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import { getStudentMentorSession, getStudentSessionFeedback, submitStudentSessionFeedback } from '../../../services/studentMentorService';

const StudentMentorFeedbackPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([getStudentMentorSession(sessionId), getStudentSessionFeedback(sessionId)])
      .then(([sessionData, feedbackData]) => {
        if (!isMounted) return;
        setSession(sessionData);
        setFeedback(feedbackData);
        if (feedbackData) {
          setRating(feedbackData.rating);
          setComment(feedbackData.comment || '');
        }
      })
      .catch((requestError) => { if (isMounted) setError(requestError.response?.data?.message || 'Unable to load feedback.'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [sessionId]);

  const submitFeedback = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const response = await submitStudentSessionFeedback(sessionId, { rating, comment });
      setFeedback(response.data.feedback);
      setSuccess('Feedback Submitted');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="max-w-2xl mx-auto space-y-6"><CardSkeleton /><CardSkeleton /></div>;
  if (!session) return <EmptyState title="Session not found" description={error || 'This session is unavailable.'} actionText="Back to Sessions" onAction={() => navigate('/student/mentor-sessions')} />;
  if (session.status !== 'Completed') return <EmptyState title="Feedback is not available yet" description="Feedback can only be submitted after a completed session." actionText="Back to Sessions" onAction={() => navigate('/student/mentor-sessions')} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/student/mentor-sessions/${sessionId}`)}>Back to Session</Button>
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Rate Your Mentor</h1><p className="text-sm text-slate-500 mt-1">{session.mentor?.name || 'Mentor'} · {session.topic}</p></div>
        {error && <div role="alert" className="rounded-xl bg-red-50 border border-red-100 text-red-700 p-3 text-sm">{error}</div>}
        {success && <div role="status" className="rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 text-sm">{success}</div>}
        {feedback ? <div className="bg-slate-50 rounded-2xl p-5 space-y-3"><p className="font-bold text-slate-900">Your Rating</p><p className="text-amber-500">{'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}</p>{feedback.comment && <p className="text-sm text-slate-600">{feedback.comment}</p>}</div> : <form onSubmit={submitFeedback} className="space-y-5"><div><p className="text-sm font-bold text-slate-700 mb-2">Rating</p><div className="flex gap-2" role="radiogroup" aria-label="Mentor rating">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} aria-label={`${value} star${value > 1 ? 's' : ''}`} onClick={() => setRating(value)} className={value <= rating ? 'text-amber-500' : 'text-slate-300'}><Star className="w-8 h-8 fill-current" /></button>)}</div></div><label className="block space-y-2"><span className="text-sm font-bold text-slate-700">Feedback <span className="font-normal text-slate-400">(optional)</span></span><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows="5" placeholder="Share what was helpful..." className="w-full p-3 text-sm border border-slate-200 rounded-xl" /></label><Button type="submit" isLoading={isSubmitting} isDisabled={!rating}>Submit Feedback</Button></form>}
      </section>
    </div>
  );
};

export default StudentMentorFeedbackPage;