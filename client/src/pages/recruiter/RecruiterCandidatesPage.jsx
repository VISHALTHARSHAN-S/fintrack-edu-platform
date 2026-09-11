import React, { useEffect, useMemo, useState } from 'react';
import { Award, BriefcaseBusiness, Filter, MapPin, Search, ShieldCheck, UserRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import { fetchRecruiterCandidates } from '../../services/recruiterCandidateService';

const scoreBand = (value) => value >= 90 ? '90+' : value >= 80 ? '80-89' : 'Below 80';
const scoreOptions = [{ value: '90+', label: '90+ score' }, { value: '80-89', label: '80-89 score' }, { value: 'Below 80', label: 'Below 80' }];

const RecruiterCandidatesPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [filters, setFilters] = useState({ search: '', skill: '', experience: '', education: '', location: '', readiness: '', skillScore: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecruiterCandidates().then((result) => {
      setCandidates(result.candidates);
      if (result.usingFallback) setError('Candidates API is unavailable. Showing demo data.');
    }).finally(() => setIsLoading(false));
  }, []);

  const options = useMemo(() => ({
    skills: [...new Set(candidates.flatMap((candidate) => candidate.skills || []))].sort(),
    experiences: [...new Set(candidates.map((candidate) => candidate.experience).filter(Boolean))].sort(),
    educations: [...new Set(candidates.map((candidate) => candidate.education).filter(Boolean))].sort(),
    locations: [...new Set(candidates.map((candidate) => candidate.location).filter(Boolean))].sort(),
  }), [candidates]);

  const filteredCandidates = useMemo(() => candidates.filter((candidate) => {
    const query = filters.search.toLowerCase();
    const searchable = `${candidate.name} ${candidate.education} ${candidate.careerObjective} ${(candidate.skills || []).join(' ')}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (!filters.skill || (candidate.skills || []).includes(filters.skill))
      && (!filters.experience || candidate.experience === filters.experience)
      && (!filters.education || candidate.education === filters.education)
      && (!filters.location || candidate.location === filters.location)
      && (!filters.readiness || scoreBand(candidate.careerReadinessScore) === filters.readiness)
      && (!filters.skillScore || scoreBand(candidate.overallSkillScore) === filters.skillScore);
  }), [candidates, filters]);

  const setFilter = (name) => (event) => setFilters((current) => ({ ...current, [name]: event.target.value }));
  const clearFilters = () => setFilters({ search: '', skill: '', experience: '', education: '', location: '', readiness: '', skillScore: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Talent directory</p>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Candidate discovery</h1>
        <p className="mt-1 text-sm text-slate-500">Search verified FinTech talent by skills, readiness, and experience.</p>
      </div>
      {error && <Toast type="error" message={error} onClose={() => setError('')} duration={0} />}

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Filter className="h-4 w-4 text-brand-600" /> Search and refine candidates</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Input name="search" value={filters.search} onChange={setFilter('search')} placeholder="Name, skill, role, education" icon={Search} />
          <Select name="skill" value={filters.skill} onChange={setFilter('skill')} options={options.skills.map((value) => ({ value, label: value }))} />
          <Select name="experience" value={filters.experience} onChange={setFilter('experience')} options={options.experiences.map((value) => ({ value, label: value }))} />
          <Select name="education" value={filters.education} onChange={setFilter('education')} options={options.educations.map((value) => ({ value, label: value }))} />
          <Select name="location" value={filters.location} onChange={setFilter('location')} options={options.locations.map((value) => ({ value, label: value }))} />
          <Select name="readiness" value={filters.readiness} onChange={setFilter('readiness')} options={scoreOptions} placeholder="Career readiness" />
          <Select name="skillScore" value={filters.skillScore} onChange={setFilter('skillScore')} options={scoreOptions} placeholder="Skill score" />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-sm text-slate-500"><strong className="text-slate-900">{filteredCandidates.length}</strong> matching {filteredCandidates.length === 1 ? 'candidate' : 'candidates'}</p>{hasFilters && <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Clear Filters</Button>}</div>
      </section>

      {isLoading ? <div className="grid gap-4 xl:grid-cols-2"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div> : filteredCandidates.length === 0 ? <EmptyState hasFilters={hasFilters} onClear={clearFilters} /> : <div className="grid gap-4 xl:grid-cols-2">{filteredCandidates.map((candidate) => <CandidateCard key={candidate.candidateId} candidate={candidate} onView={() => navigate(`/recruiter/candidates/${candidate.candidateId}`)} />)}</div>}
    </div>
  );
};

const CandidateCard = ({ candidate, onView }) => <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-card-hover sm:p-6"><div className="flex items-start gap-4"><Avatar candidate={candidate} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-base font-bold text-slate-900">{candidate.name}</h2><p className="mt-0.5 text-sm text-slate-500">{candidate.careerObjective}</p></div><Badge variant="success"><ShieldCheck className="mr-1 h-3 w-3" />{candidate.verifiedBadge}</Badge></div><div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2"><span className="flex items-center gap-1.5"><BriefcaseBusiness className="h-3.5 w-3.5" />{candidate.experience}</span><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{candidate.location}</span><span>{candidate.education}</span><span>Available: {candidate.availability}</span></div></div></div><div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4 text-center"><Score label="Skill score" value={`${candidate.overallSkillScore}%`} /><Score label="Assessment" value={candidate.assessmentScore} /><Score label="Readiness" value={`${candidate.careerReadinessScore}%`} /></div><div className="mt-4 flex flex-wrap gap-2">{(candidate.skills || []).slice(0, 5).map((skill) => <Badge key={skill} variant="brand">{skill}</Badge>)}{candidate.skills?.length > 5 && <Badge variant="slate">+{candidate.skills.length - 5} more</Badge>}</div><div className="mt-5 flex items-center justify-between gap-3"><div><p className="text-xs text-slate-400">Best active role match</p><p className="text-sm font-bold text-slate-800">{candidate.match?.matchPercentage || 0}% <span className="font-normal text-slate-500">· {candidate.match?.jobTitle}</span></p></div><Button size="sm" onClick={onView}>View 360° Profile</Button></div></article>;
const Avatar = ({ candidate }) => candidate.avatar ? <img src={candidate.avatar} alt="" className="h-12 w-12 rounded-2xl object-cover" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-950 text-white"><UserRound className="h-5 w-5" /></div>;
const Score = ({ label, value }) => <div><p className="text-lg font-extrabold text-slate-900">{value}</p><p className="text-[11px] text-slate-500">{label}</p></div>;
const EmptyState = ({ hasFilters, onClear }) => <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><Award className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 text-lg font-bold text-slate-900">No candidates found</h2><p className="mt-1 text-sm text-slate-500">{hasFilters ? 'Try broadening your search or clearing the filters.' : 'Candidate data is not available yet.'}</p>{hasFilters && <Button className="mt-5" variant="secondary" onClick={onClear}>Clear Filters</Button>}</div>;

export default RecruiterCandidatesPage;
