import React, { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import CardSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/common/Button';
import MentorCard from '../../../components/mentor/MentorCard';
import MentorFilter from '../../../components/mentor/MentorFilter';
import { getMentors, getRecommendedMentors } from '../../../services/studentMentorService';

const StudentMentorConnectPage = () => {
  const [mentors, setMentors] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [filters, setFilters] = useState({ search: '', expertise: '', rating: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadMentors = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [mentorResponse, recommendedMentors] = await Promise.all([
          getMentors(filters),
          getRecommendedMentors(),
        ]);
        if (isMounted) {
          setMentors(mentorResponse.data || []);
          setRecommended(recommendedMentors || []);
        }
      } catch (requestError) {
        if (isMounted) setError(requestError.response?.data?.message || 'Unable to load mentors. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMentors();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const hasFilters = filters.search || filters.expertise || filters.rating;

  return (
    <div className="space-y-8 pb-12">
      <section className="bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mentor Connect</h1>
            <p className="text-slate-300 text-sm mt-2">Connect with industry experts for focused guidance on your FinTech learning journey.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            placeholder="Search mentors by name, expertise, company..."
            aria-label="Search mentors"
            className="w-full bg-white pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <MentorFilter filters={filters} onChange={setFilters} />
      </section>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => <CardSkeleton key={index} />)}
        </div>
      ) : error ? (
        <EmptyState title="Mentors are unavailable" description={error} actionText="Try Again" onAction={() => setFilters({ ...filters })} />
      ) : (
        <>
          {!hasFilters && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recommended Mentors</h2>
                <p className="text-sm text-slate-500 mt-1">Active mentors ordered by the platform's available profile signals.</p>
              </div>
              {recommended.length === 0 ? (
                <EmptyState title="No mentors are currently available" description="Check back later when active mentor profiles are added." />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{recommended.map((mentor) => <MentorCard key={mentor.mentorId} mentor={mentor} />)}</div>
              )}
            </section>
          )}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{hasFilters ? 'Matching Mentors' : 'All Mentors'}</h2>
              <p className="text-sm text-slate-500 mt-1">Browse active mentor profiles from the FinTrack Edu community.</p>
            </div>
            {mentors.length === 0 ? (
              <EmptyState title="No mentors are currently available" description="Try a different search or filter, or check back later." />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{mentors.map((mentor) => <MentorCard key={mentor.mentorId} mentor={mentor} />)}</div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentMentorConnectPage;