import React, { useEffect, useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { Save, Send } from 'lucide-react';

const initialForm = {
  title: '',
  company: '',
  location: '',
  workMode: 'Hybrid',
  employmentType: 'Full-time',
  experienceLevel: '',
  salaryRange: '',
  requiredSkills: '',
  preferredSkills: '',
  description: '',
  responsibilities: '',
  requirements: '',
  applicationDeadline: '',
};

const toText = (value) => (Array.isArray(value) ? value.join('\n') : value || '');

export const jobToForm = (job) => ({
  title: job?.title || '',
  company: job?.company || '',
  location: job?.location || '',
  workMode: job?.workMode || 'Hybrid',
  employmentType: job?.employmentType || 'Full-time',
  experienceLevel: job?.experienceLevel || '',
  salaryRange: job?.salaryRange || '',
  requiredSkills: toText(job?.requiredSkills),
  preferredSkills: toText(job?.preferredSkills),
  description: job?.description || '',
  responsibilities: toText(job?.responsibilities),
  requirements: toText(job?.requirements),
  applicationDeadline: job?.applicationDeadline ? String(job.applicationDeadline).slice(0, 10) : '',
});

const splitLines = (value) => value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);

const JobForm = ({ initialJob, isSubmitting, submitLabel, onSubmit, onCancel, showPublish }) => {
  const [form, setForm] = useState(initialJob ? jobToForm(initialJob) : initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialJob ? jobToForm(initialJob) : initialForm);
  }, [initialJob]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = (status) => {
    const nextErrors = {};
    ['title', 'company', 'location', 'experienceLevel', 'salaryRange', 'description', 'applicationDeadline'].forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = 'This field is required.';
    });
    if (!splitLines(form.requiredSkills).length) nextErrors.requiredSkills = 'Add at least one required skill.';
    if (!splitLines(form.responsibilities).length) nextErrors.responsibilities = 'Add at least one responsibility.';
    if (!splitLines(form.requirements).length) nextErrors.requirements = 'Add at least one requirement.';
    if (status === 'ACTIVE' && !form.applicationDeadline) nextErrors.applicationDeadline = 'A publish deadline is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event, status) => {
    event.preventDefault();
    if (!validate(status)) return;
    onSubmit({
      ...form,
      status,
      requiredSkills: splitLines(form.requiredSkills),
      preferredSkills: splitLines(form.preferredSkills),
      responsibilities: splitLines(form.responsibilities),
      requirements: splitLines(form.requirements),
      applicationDeadline: form.applicationDeadline,
    });
  };

  return (
    <form className="space-y-6" onSubmit={(event) => handleSubmit(event, showPublish ? 'ACTIVE' : (initialJob?.status || 'DRAFT'))}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Job title" name="title" value={form.title} onChange={updateField} error={errors.title} required placeholder="Junior Quantitative Developer" />
        <Input label="Company" name="company" value={form.company} onChange={updateField} error={errors.company} required placeholder="Nexus Financial Solutions" />
        <Input label="Location" name="location" value={form.location} onChange={updateField} error={errors.location} required placeholder="Chennai, India" />
        <Select label="Work mode" name="workMode" value={form.workMode} onChange={updateField} options={['On-site', 'Hybrid', 'Remote'].map((value) => ({ value, label: value }))} />
        <Select label="Employment type" name="employmentType" value={form.employmentType} onChange={updateField} options={['Full-time', 'Part-time', 'Internship'].map((value) => ({ value, label: value }))} />
        <Input label="Experience level" name="experienceLevel" value={form.experienceLevel} onChange={updateField} error={errors.experienceLevel} required placeholder="0-2 Years" />
        <Input label="Salary range" name="salaryRange" value={form.salaryRange} onChange={updateField} error={errors.salaryRange} required placeholder="INR 12,00,000 - INR 18,00,000 P.A." />
        <Input label="Application deadline" type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={updateField} error={errors.applicationDeadline} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Required skills" name="requiredSkills" value={form.requiredSkills} onChange={updateField} error={errors.requiredSkills} required placeholder="Python, SQL, Financial Markets" helperText="Separate skills with commas." />
        <Input label="Preferred skills" name="preferredSkills" value={form.preferredSkills} onChange={updateField} placeholder="Git, NumPy, C++" helperText="Separate skills with commas." />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {[['description', 'Description', 'Describe the opportunity and team.'], ['responsibilities', 'Responsibilities', 'One responsibility per line.', errors.responsibilities], ['requirements', 'Requirements', 'One requirement per line.', errors.requirements]].map(([name, label, placeholder, error]) => (
          <div key={name} className="space-y-1.5">
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label} <span className="text-red-500">*</span></label>
            <textarea id={name} name={name} value={form[name]} onChange={updateField} rows={6} placeholder={placeholder} className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'}`} />
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        {!showPublish && <Button type="button" variant="secondary" icon={Save} isLoading={isSubmitting} onClick={(event) => handleSubmit(event, 'DRAFT')}>Save Draft</Button>}
        <Button type="submit" icon={showPublish ? Send : Save} isLoading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export default JobForm;
