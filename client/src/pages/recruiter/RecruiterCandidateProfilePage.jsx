import React, { useEffect, useState } from 'react';
import { ArrowLeft, Award, BriefcaseBusiness, Calendar, CheckCircle2, ExternalLink, Mail, MessageSquare, MapPin, ShieldCheck, UserRound, Video, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import Toast from '../../components/common/Toast';
import { fetchRecruiterCandidate } from '../../services/recruiterCandidateService';

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not available';

const RecruiterCandidateProfilePage = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetchRecruiterCandidate(candidateId)
      .then(setCandidate)
      .catch((requestError) => setError(requestError.code === 'CANDIDATE_NOT_FOUND' ? 'Candidate not found.' : requestError.response?.data?.message || 'Unable to load this candidate.'))
      .finally(() => setIsLoading(false));
  }, [candidateId]);

  if (isLoading) return <div className="space-y-5"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
  if (error || !candidate) return <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm"><UserRound className="mx-auto h-10 w-10 text-slate-300" /><h1 className="mt-4 text-xl font-bold text-slate-900">{error || 'Candidate not found.'}</h1><p className="mt-1 text-sm text-slate-500">The candidate may have been removed or the profile link is invalid.</p><Button className="mt-5" variant="secondary" icon={ArrowLeft} onClick={() => navigate('/recruiter/candidates')}>Back to Candidates</Button></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/recruiter/candidates')}>Back to Candidates</Button>
      {notice && <Toast type="success" message={notice} onClose={() => setNotice('')} />}
      <section className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 p-6 text-white shadow-xl sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"><div className="flex items-start gap-4"><Avatar candidate={candidate} /><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-extrabold sm:text-3xl">{candidate.name}</h1><Badge variant="success"><ShieldCheck className="mr-1 h-3 w-3" />{candidate.verifiedBadge}</Badge></div><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{candidate.careerObjective}</p><div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-300"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{candidate.location}</span><span className="flex items-center gap-1.5"><BriefcaseBusiness className="h-3.5 w-3.5" />{candidate.experience}</span><span>Available: {candidate.availability}</span></div></div></div><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" icon={Mail} onClick={() => setNotice('Contact action is ready for the recruiter messages module.')}>Contact</Button><Button variant="primary" size="sm" icon={Video} onClick={() => setNotice('Interview invitation is ready for the interview module.')}>Invite to Interview</Button></div></div></section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <main className="space-y-6">
          <Section title="Profile"><div className="grid gap-4 text-sm sm:grid-cols-2"><Info label="Education" value={candidate.education} /><Info label="Location" value={candidate.location} /><Info label="Experience" value={candidate.experience} /><Info label="Availability" value={candidate.availability} /><Info label="Email" value={candidate.email} /></div></Section>
          <Section title="Skills"><div className="mb-5 flex flex-wrap gap-2">{(candidate.skills || []).map((skill) => <Badge key={skill} variant="brand">{skill}</Badge>)}</div><div className="grid gap-3 sm:grid-cols-2"><Metric label="Overall skill score" value={`${candidate.overallSkillScore}%`} /><Metric label="Verified badge" value={candidate.verifiedBadge} /></div></Section>
          <Section title="Performance"><div className="grid gap-3 sm:grid-cols-3"><Metric label="Practice accuracy" value={`${candidate.practiceAccuracy}%`} /><Metric label="Assessment score" value={candidate.assessmentScore} /><Metric label="Career readiness" value={`${candidate.careerReadinessScore}%`} /></div></Section>
          <Section title="Skill Passport"><div className="space-y-4">{(candidate.skillPassport?.verifiedSkills || []).map((skill) => <div key={skill.skill} className="flex flex-col gap-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-slate-800">{skill.skill}</p><p className="text-xs text-slate-500">{skill.verificationSource} · {skill.level}</p></div><Badge variant="success">{skill.proficiency}% verified</Badge></div>)}<div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Certifications</p><div className="grid gap-3 sm:grid-cols-2">{(candidate.skillPassport?.certifications || []).map((certification) => <div key={certification.title} className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-bold text-slate-800">{certification.title}</p><p className="mt-1 text-xs text-slate-500">{certification.issuer} · {certification.issueDate}</p>{certification.credentialUrl && <a className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700" href={certification.credentialUrl} target="_blank" rel="noreferrer">Verify credential <ExternalLink className="h-3 w-3" /></a>}</div>)}</div></div><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Badges and achievements</p><div className="flex flex-wrap gap-2">{(candidate.skillPassport?.badges || []).map((badge) => <Badge key={badge} variant="purple"><Award className="mr-1 h-3 w-3" />{badge}</Badge>)}</div></div><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Projects</p><div className="grid gap-3 sm:grid-cols-2">{(candidate.skillPassport?.projects || []).map((project) => <div key={project.title} className="rounded-xl border border-slate-100 p-3"><p className="text-sm font-bold text-slate-800">{project.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{project.description}</p><div className="mt-2 flex flex-wrap gap-1">{(project.techStack || []).map((tech) => <Badge key={tech} variant="slate">{tech}</Badge>)}</div></div>)}</div></div></div></Section>
          <Section title="Application history">{(candidate.applicationHistory || []).length ? <div className="space-y-3">{candidate.applicationHistory.map((application) => <div key={`${application.jobId}-${application.appliedDate}`} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-slate-800">{application.jobTitle}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Calendar className="h-3.5 w-3.5" />Applied {formatDate(application.appliedDate)}</p></div><Badge variant={application.status === 'SHORTLISTED' ? 'success' : 'info'}>{application.status}</Badge></div>)}</div> : <p className="text-sm text-slate-500">No application history available.</p>}</Section>
        </main>
        <aside className="space-y-4"><Section title="Career readiness"><div className="text-center"><p className="text-5xl font-extrabold text-brand-700">{candidate.careerReadinessScore}%</p><p className="mt-1 text-sm text-slate-500">Overall readiness score</p></div><div className="mt-5 space-y-3"><List title="Strengths" items={candidate.strengths} icon={CheckCircle2} color="text-emerald-500" /><List title="Improvement areas" items={candidate.weakAreas} icon={XCircle} color="text-amber-500" /></div></Section><Section title="Recruiter actions"><div className="space-y-2"><Button fullWidth variant="secondary" icon={CheckCircle2} onClick={() => setNotice('Candidate shortlist action is ready for the applications module.')}>Shortlist Candidate</Button><Button fullWidth variant="secondary" icon={XCircle} onClick={() => setNotice('Candidate rejection action is ready for the applications module.')}>Reject Candidate</Button><Button fullWidth variant="secondary" icon={MessageSquare} onClick={() => setNotice('Contact action is ready for the recruiter messages module.')}>Contact Candidate</Button></div></Section></aside>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-4 text-base font-bold text-slate-900">{title}</h2>{children}</section>;
const Info = ({ label, value }) => <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || 'Not available'}</p></div>;
const Metric = ({ label, value }) => <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-extrabold text-slate-900">{value}</p></div>;
const List = ({ title, items = [], icon: Icon, color }) => <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p><ul className="space-y-2">{(items || []).map((item) => <li key={item} className="flex gap-2 text-sm text-slate-600"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />{item}</li>)}</ul></div>;
const Avatar = ({ candidate }) => candidate.avatar ? <img src={candidate.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-100"><UserRound className="h-7 w-7" /></div>;

export default RecruiterCandidateProfilePage;
