import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  ExternalLink,
  FileCheck2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { fetchStudentSkillDetails, fetchStudentSkillSummary } from '../../services/studentSkillService';

const CATEGORY_OPTIONS = ['All categories', 'Programming', 'Problem Solving', 'Data', 'FinTech'];
const LEVEL_OPTIONS = ['All levels', 'Beginner', 'Intermediate', 'Advanced', 'Not assessed yet'];

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

const getLevelVariant = (level) => {
  if (level === 'Advanced') return 'success';
  if (level === 'Intermediate') return 'brand';
  if (level === 'Beginner') return 'warning';
  return 'slate';
};

const evidenceIcon = (type) => {
  if (type === 'assessment') return FileCheck2;
  if (type === 'practice') return Code2;
  if (type === 'certificate') return Award;
  if (type === 'project') return BriefcaseBusiness;
  return BookOpen;
};

const StudentSkillsPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [levelFilter, setLevelFilter] = useState('All levels');
  const [expandedSkill, setExpandedSkill] = useState('');
  const [skillDetails, setSkillDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState('');
  const [detailError, setDetailError] = useState('');

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      setData(await fetchStudentSkillSummary());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const filteredSkills = useMemo(
    () =>
      (data?.skills || []).filter((skill) => {
        const categoryMatches =
          categoryFilter === 'All categories' || skill.category === categoryFilter;
        const skillLevel = skill.level || 'Not assessed yet';
        const levelMatches = levelFilter === 'All levels' || skillLevel === levelFilter;
        return categoryMatches && levelMatches;
      }),
    [categoryFilter, data, levelFilter]
  );

  const toggleSkillDetails = async (skillId) => {
    if (expandedSkill === skillId) {
      setExpandedSkill('');
      setDetailError('');
      return;
    }

    setExpandedSkill(skillId);
    setDetailError('');
    if (skillDetails[skillId]) return;

    setDetailLoading(skillId);
    try {
      const result = await fetchStudentSkillDetails(skillId);
      setSkillDetails((current) => ({ ...current, [skillId]: result }));
    } catch (error) {
      setDetailError(error.message);
    } finally {
      setDetailLoading('');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 py-4" aria-live="polite">
        <div className="h-48 animate-pulse rounded-3xl bg-white shadow-sm" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
        <p className="text-center text-sm text-slate-500">Loading your skill evidence...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Your skill tracker could not load</h1>
        <p className="mt-2 text-sm text-slate-600">{loadError}</p>
        <Button className="mt-5" icon={RefreshCw} onClick={loadSummary}>Try again</Button>
      </div>
    );
  }

  const { summary, recommendations, passport } = data;

  return (
    <div className="space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-300/25 bg-brand-300/10 px-3 py-1 text-xs font-semibold text-brand-200">
            <Sparkles className="h-4 w-4" /> Evidence-based skill growth
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Your Student Skill Tracker</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            See what your completed assessments and practice sessions demonstrate, then choose a focused next step.
            Skills without completed results remain unassessed.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Metric icon={TrendingUp} label="Overall skill score" value={summary.overallScore === null ? '—' : `${summary.overallScore}%`} />
            <Metric icon={Target} label="Skills assessed" value={`${summary.assessedSkillCount} / ${summary.totalSkillCount}`} />
          </div>
        </div>
        <Target className="absolute -bottom-9 -right-4 hidden h-48 w-48 text-white/[0.06] sm:block" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <InsightPanel
          title="Strengths"
          icon={CheckCircle2}
          variant="emerald"
          skills={summary.strengths}
          emptyText="Complete relevant practice or assessments to identify your strengths."
        />
        <InsightPanel
          title="Skill gaps to work on"
          icon={Target}
          variant="amber"
          skills={summary.skillGaps}
          emptyText="No assessed skill is currently below Beginner level."
        />
      </div>

      <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Skill matrix</h2>
            <p className="mt-1 text-sm text-slate-500">Scores average completed assessment and practice results for each skill.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FilterSelect
              label="Category"
              value={categoryFilter}
              options={CATEGORY_OPTIONS}
              onChange={setCategoryFilter}
            />
            <FilterSelect
              label="Proficiency"
              value={levelFilter}
              options={LEVEL_OPTIONS}
              onChange={setLevelFilter}
            />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              expanded={expandedSkill === skill.id}
              detail={skillDetails[skill.id]}
              isLoadingDetail={detailLoading === skill.id}
              detailError={expandedSkill === skill.id ? detailError : ''}
              onToggle={() => toggleSkillDetails(skill.id)}
              onRetry={() => {
                setSkillDetails((current) => {
                  const next = { ...current };
                  delete next[skill.id];
                  return next;
                });
                setDetailError('');
                setDetailLoading(skill.id);
                fetchStudentSkillDetails(skill.id)
                  .then((result) => setSkillDetails((current) => ({ ...current, [skill.id]: result })))
                  .catch((error) => setDetailError(error.message))
                  .finally(() => setDetailLoading(''));
              }}
            />
          ))}
          {filteredSkills.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 lg:col-span-2">
              No skills match these filters.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-brand-950 via-slate-900 to-navy-950 p-5 text-white shadow-xl sm:p-7">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-400/10 p-2 text-amber-300"><Sparkles className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-bold">Recommended next steps</h2>
            <p className="mt-1 text-sm text-slate-300">Recommendations are based on unassessed skills and the areas with the most room to grow.</p>
          </div>
        </div>
        {recommendations.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((recommendation) => (
              <article key={recommendation.skillId} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4">
                <Badge variant="warning" className="w-fit">{recommendation.skill}</Badge>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{recommendation.reason}</p>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                  {recommendation.actions.map((action) => (
                    <Link
                      key={`${action.type}-${action.href}`}
                      to={action.href}
                      className="flex items-center justify-between gap-2 text-xs font-semibold text-brand-200 transition-colors hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        {action.type === 'assessment' ? <FileCheck2 className="h-4 w-4 shrink-0" /> : action.type === 'practice' ? <Code2 className="h-4 w-4 shrink-0" /> : <BookOpen className="h-4 w-4 shrink-0" />}
                        {action.title}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Great work: every assessed skill is at least Intermediate. Keep practicing to maintain your progress.
          </p>
        )}
      </section>

      <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand-50 p-2 text-brand-700"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Skill Passport</h2>
            <p className="mt-1 text-sm text-slate-500">A portfolio view of skills with learning evidence, earned certificates, and recorded projects.</p>
          </div>
        </div>

        {passport.skills.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Evidence-backed skills</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {passport.skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{skill.skill}</p>
                    <p className="mt-1 text-xs text-slate-500">{skill.verificationSource}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{skill.proficiency}%</p>
                    <Badge variant={getLevelVariant(skill.level)}>{skill.level}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <PassportList
            title="Certificates"
            items={passport.certificates}
            emptyText="Certificates you earn will appear here."
            renderItem={(certificate) => (
              <div key={certificate.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 p-4">
                <div className="flex gap-3">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{certificate.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{certificate.issuer}{certificate.issueDate ? ` · ${formatDate(certificate.issueDate)}` : ''}</p>
                  </div>
                </div>
                <Link to={certificate.verificationUrl} className="shrink-0 text-brand-700 hover:text-brand-900" aria-label={`Verify ${certificate.title}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            )}
          />
          <PassportList
            title="Completed projects"
            items={passport.projects}
            emptyText="Projects recorded in your Skill Passport will appear here."
            renderItem={(project) => (
              <div key={project.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{project.title}</p>
                    {project.description && <p className="mt-1 text-xs leading-5 text-slate-500">{project.description}</p>}
                  </div>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="shrink-0 text-brand-700 hover:text-brand-900" aria-label={`Open ${project.title}`}>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {project.techStack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.techStack.map((technology) => <Badge key={technology} variant="slate">{technology}</Badge>)}
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </section>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-44 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <Icon className="h-5 w-5 text-brand-300" />
    <div>
      <p className="text-xs text-slate-300">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  </div>
);

const InsightPanel = ({ title, icon: Icon, variant, skills, emptyText }) => {
  const style = variant === 'emerald'
    ? { panel: 'border-emerald-100 bg-emerald-50/60', icon: 'text-emerald-600', badge: 'success' }
    : { panel: 'border-amber-100 bg-amber-50/60', icon: 'text-amber-600', badge: 'warning' };

  return (
    <section className={`rounded-3xl border p-5 ${style.panel}`}>
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Icon className={`h-5 w-5 ${style.icon}`} /> {title}
      </h2>
      {skills.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill.id} variant={style.badge}>{skill.name} · {skill.score}%</Badge>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600">{emptyText}</p>
      )}
    </section>
  );
};

const FilterSelect = ({ label, value, options, onChange }) => (
  <div className="min-w-36">
    <Select
      label={label}
      name={`skill-${label.toLowerCase().replaceAll(' ', '-')}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={options.map((option) => ({ value: option, label: option }))}
      placeholder=""
    />
  </div>
);

const SkillCard = ({ skill, expanded, detail, isLoadingDetail, detailError, onToggle, onRetry }) => (
  <article className="rounded-2xl border border-slate-100 bg-white p-4 transition-shadow hover:shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-slate-900">{skill.name}</h3>
          <Badge variant="slate">{skill.category}</Badge>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {skill.score === null ? 'Not assessed yet' : `${skill.evidenceCount} evidence item${skill.evidenceCount === 1 ? '' : 's'}`}
        </p>
      </div>
      {skill.level && <Badge variant={getLevelVariant(skill.level)}>{skill.level}</Badge>}
    </div>

    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">Assessed score</span>
        <span className="font-bold text-slate-800">{skill.score === null ? '—' : `${skill.score}%`}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${skill.name} score`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={skill.score ?? undefined}
      >
        {skill.score !== null && (
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${skill.score}%` }} />
        )}
      </div>
    </div>

    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
    >
      View evidence {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>

    {expanded && (
      <div className="mt-3 border-t border-slate-100 pt-3">
        {isLoadingDetail ? (
          <div className="flex items-center gap-2 py-3 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading evidence...</div>
        ) : detailError ? (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <p>{detailError}</p>
            <button type="button" onClick={onRetry} className="mt-2 font-semibold underline">Try again</button>
          </div>
        ) : detail?.evidence?.length ? (
          <ul className="space-y-3">
            {detail.evidence.map((evidence) => {
              const Icon = evidenceIcon(evidence.type);
              const content = (
                <>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-slate-800">{evidence.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{evidence.description}</span>
                  </span>
                  {evidence.date && <span className="shrink-0 text-[11px] text-slate-400">{formatDate(evidence.date)}</span>}
                  {evidence.href && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                </>
              );

              return (
                <li key={`${evidence.type}-${evidence.id}`}>
                  {evidence.href ? (
                    <Link to={evidence.href} className="flex items-start gap-2 rounded-xl p-2 hover:bg-slate-50">{content}</Link>
                  ) : (
                    <div className="flex items-start gap-2 rounded-xl p-2">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-2 text-xs text-slate-500">No learning evidence has been recorded for this skill yet.</p>
        )}
      </div>
    )}
  </article>
);

const PassportList = ({ title, items, emptyText, renderItem }) => (
  <div>
    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
    {items.length ? (
      <div className="space-y-3">{items.map(renderItem)}</div>
    ) : (
      <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{emptyText}</p>
    )}
  </div>
);

export default StudentSkillsPage;
