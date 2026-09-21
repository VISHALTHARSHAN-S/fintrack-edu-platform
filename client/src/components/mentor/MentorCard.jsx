import React from 'react';
import { CalendarDays, Star, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Badge from '../common/Badge';

const MentorCard = ({ mentor }) => {
  const navigate = useNavigate();
  const initials = mentor.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start gap-3">
        {mentor.avatar ? (
          <img src={mentor.avatar} alt={mentor.name} className="w-14 h-14 rounded-2xl object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
            {initials || <UserRound className="w-6 h-6" />}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{mentor.name}</h3>
          {mentor.designation && <p className="text-xs text-slate-600 mt-1">{mentor.designation}</p>}
          {mentor.company && <p className="text-xs text-slate-400">{mentor.company}</p>}
        </div>
      </div>

      {mentor.expertise && (
        <div>
          <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">Expertise</p>
          <p className="text-sm text-slate-700 mt-1">{mentor.expertise}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {typeof mentor.rating === 'number' && (
          <Badge variant="amber" size="sm">
            <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> {mentor.rating}</span>
          </Badge>
        )}
        {mentor.availability && (
          <Badge variant={mentor.availability.available ? 'emerald' : 'danger'} size="sm">
            <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {mentor.availability.available ? 'Available' : 'Unavailable'}</span>
          </Badge>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-2 border-t border-slate-100">
        <Button variant="secondary" size="sm" fullWidth onClick={() => navigate(`/student/mentors/${mentor.mentorId}`)}>
          View Profile
        </Button>
        <Button variant="primary" size="sm" fullWidth onClick={() => navigate(`/student/mentors/${mentor.mentorId}/book`)}>
          Book Session
        </Button>
      </div>
    </article>
  );
};

export default MentorCard;