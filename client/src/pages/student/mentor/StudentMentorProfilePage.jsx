import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Star, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import CardSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import { getMentorProfile } from '../../../services/studentMentorService';

const StudentMentorProfilePage = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getMentorProfile(mentorId)
      .then((profile) => { if (isMounted) setMentor(profile); })
      .catch((requestError) => { if (isMounted) setError(requestError.response?.data?.message || 'Unable to load mentor profile.'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [mentorId]);

  if (isLoading) return <div className="max-w-4xl mx-auto space-y-6"><CardSkeleton /><CardSkeleton /></div>;
  if (error || !mentor) return <EmptyState title="Mentor not found" description={error || 'This mentor profile is not available.'} actionText="Back to Mentors" onAction={() => navigate('/student/mentors')} />;

  const initials = mentor.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/student/mentors')}>Back to Mentors</Button>
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {mentor.avatar ? <img src={mentor.avatar} alt={mentor.name} className="w-20 h-20 rounded-2xl object-cover" /> : <div className="w-20 h-20 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center text-xl font-bold">{initials || <UserRound />}</div>}
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{mentor.name}</h1>
              {mentor.designation && <p className="text-sm text-slate-600 mt-1">{mentor.designation}</p>}
              {mentor.company && <p className="text-sm text-slate-400">{mentor.company}</p>}
            </div>
          </div>
          <Button variant="primary" icon={CalendarDays} onClick={() => navigate(`/student/mentors/${mentor.mentorId}/book`)}>Book Session</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-100">
          {mentor.expertise && <Badge variant="brand" size="sm">{mentor.expertise}</Badge>}
          {typeof mentor.rating === 'number' && <Badge variant="amber" size="sm"><span className="inline-flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> {mentor.rating}</span></Badge>}
          {mentor.availability && <Badge variant={mentor.availability.available ? 'emerald' : 'danger'} size="sm">{mentor.availability.available ? 'Currently available' : 'Currently unavailable'}</Badge>}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-5">
        <div><h2 className="text-lg font-bold text-slate-900">Professional Information</h2><p className="text-sm text-slate-500 mt-1">Public information from this mentor's profile.</p></div>
        {mentor.expertise ? <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Expertise</p><p className="text-sm text-slate-700 mt-2">{mentor.expertise}</p></div> : <p className="text-sm text-slate-500">No additional professional information is available.</p>}
        {mentor.availability?.availableDays?.length > 0 && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Availability summary</p><p className="text-sm text-slate-700 mt-2">Available on {mentor.availability.availableDays.join(', ')}.</p></div>}
      </section>
    </div>
  );
};

export default StudentMentorProfilePage;