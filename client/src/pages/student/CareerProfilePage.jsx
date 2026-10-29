import React, { useCallback, useEffect, useState } from 'react';
import { Award, BriefcaseBusiness, ExternalLink, Save } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CareerNav from '../../components/student/CareerNav';
import { ErrorState, LoadingState } from '../../components/student/CareerStates';
import { fetchCareerProfile, saveCareerProfile } from '../../services/careerService';

const CareerProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await fetchCareerProfile();
      setProfile(result);
      setForm({
        education: result.education,
        experience: result.experience || '',
        careerObjective: result.careerObjective,
        location: result.location,
        preferredRoles: result.preferredRoles.join(', '),
        preferredLocations: result.preferredLocations.join(', '),
        workModePreference: result.workModePreference,
        skills: result.profileSkills.join(', '),
        resumeUrl: result.resumeUrl,
      });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setSaveError(''); setSaved(false);
    const list = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);
    try {
      const result = await saveCareerProfile({
        education: form.education,
        experience: form.experience,
        careerObjective: form.careerObjective,
        location: form.location,
        preferredRoles: list(form.preferredRoles),
        preferredLocations: list(form.preferredLocations),
        workModePreference: form.workModePreference,
        skills: list(form.skills),
        resumeUrl: form.resumeUrl,
      });
      setProfile(result);
      setForm((current) => ({ ...current, skills: result.profileSkills.join(', ') }));
      setSaved(true);
    } catch (err) { setSaveError(err.message); } finally { setSaving(false); }
  };

  if (loading) return <LoadingState label="Loading your career profile..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6 pb-10">
      <CareerNav />
      <div className="grid gap-5 lg:grid-cols-[1fr_21rem]">
        <form onSubmit={save} className="space-y-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <div><h2 className="text-xl font-bold text-slate-900">Career profile</h2><p className="mt-1 text-sm text-slate-500">Keep your profile current so applications and job matching use your information.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={profile.name} disabled />
            <Field label="Email" value={profile.email} disabled />
            <Field label="Education" name="education" value={form.education} onChange={update} placeholder="Degree and institution" />
            <Field label="Experience" name="experience" value={form.experience} onChange={update} placeholder="Relevant experience (optional)" />
            <Field label="Location" name="location" value={form.location} onChange={update} placeholder="City, country" />
            <Field label="Preferred job roles" name="preferredRoles" value={form.preferredRoles} onChange={update} placeholder="Frontend Engineer, Analyst" helper="Separate values with commas." />
            <Field label="Preferred locations" name="preferredLocations" value={form.preferredLocations} onChange={update} placeholder="Chennai, Remote" helper="Separate values with commas." />
            <Field label="Work mode preference" name="workModePreference" value={form.workModePreference} onChange={update} placeholder="Remote, Hybrid, On-site" />
            <Field label="Skills you want recruiters to consider" name="skills" value={form.skills} onChange={update} placeholder="Java, React, SQL" helper="Self-reported skills are compared separately from assessed tracker skills." />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Career objective</span>
            <textarea name="careerObjective" value={form.careerObjective} onChange={update} maxLength={1000} rows={4} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="What kind of opportunity are you looking for?" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Resume URL</span>
            <input name="resumeUrl" type="url" value={form.resumeUrl} onChange={update} maxLength={1000} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="https://..." />
            <span className="mt-1 block text-xs text-slate-500">A valid resume URL is required before submitting job applications.</span>
          </label>
          {saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}
          {saved && <p role="status" className="text-sm text-emerald-700">Career profile saved.</p>}
          <Button type="submit" icon={Save} isLoading={saving}>Save profile</Button>
        </form>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-slate-900"><BriefcaseBusiness className="h-4 w-4 text-brand-700" /> Skill evidence</h3>
            <p className="mt-1 text-xs text-slate-500">Evidence from assessments, practice and your Skill Passport.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.length ? profile.skills.map((skill) => <Badge key={skill} variant="slate">{skill}</Badge>) : <p className="text-sm text-slate-500">No skills recorded yet.</p>}
            </div>
            <a href="/student/skills" className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:text-brand-900">Open Skill Tracker</a>
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-slate-900"><BriefcaseBusiness className="h-4 w-4 text-brand-700" /> Projects</h3>
            <div className="mt-3 space-y-3">
              {profile.projects.length ? profile.projects.map((project) => (
                <div key={project.title} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">{project.title}</p>
                  {project.description && <p className="mt-1 text-xs leading-5 text-slate-500">{project.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">{project.techStack.map((skill) => <Badge key={skill} variant="slate">{skill}</Badge>)}</div>
                  {project.githubUrl && <a className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700" href={project.githubUrl} target="_blank" rel="noreferrer">Project link <ExternalLink className="h-3 w-3" /></a>}
                </div>
              )) : <p className="text-sm text-slate-500">No Skill Passport projects recorded.</p>}
            </div>
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-slate-900"><Award className="h-4 w-4 text-amber-500" /> Certifications</h3>
            <div className="mt-3 space-y-3">
              {profile.certificates.length ? profile.certificates.map((certificate) => (
                <div key={`${certificate.title}-${certificate.issueDate}`} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">{certificate.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{certificate.issuer} · {new Date(certificate.issueDate).toLocaleDateString()}</p>
                  <a className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700" href={certificate.verificationUrl}>Verify <ExternalLink className="h-3 w-3" /></a>
                </div>
              )) : <p className="text-sm text-slate-500">No certificates recorded.</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, placeholder, helper, disabled = false }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
    <input name={name} value={value || ''} onChange={onChange} placeholder={placeholder} disabled={disabled} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm disabled:bg-slate-50 disabled:text-slate-500 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100" />
    {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
  </label>
);

export default CareerProfilePage;
