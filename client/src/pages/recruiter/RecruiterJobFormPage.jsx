import React, { useEffect, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import CardSkeleton from '../../components/common/LoadingSkeleton';
import Toast from '../../components/common/Toast';
import JobForm from '../../components/recruiter/JobForm';
import { createRecruiterJob, fetchRecruiterJob, updateRecruiterJob } from '../../services/recruiterJobService';

const RecruiterJobFormPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditing = Boolean(jobId);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEditing) return undefined;
    fetchRecruiterJob(jobId)
      .then(setJob)
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load this job.'))
      .finally(() => setIsLoading(false));
    return undefined;
  }, [isEditing, jobId]);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (isEditing) {
        await updateRecruiterJob(jobId, payload);
        navigate(`/recruiter/jobs/${jobId}`, { state: { success: 'Job changes saved successfully.' } });
      } else {
        const createdJob = await createRecruiterJob(payload);
        setSuccess(payload.status === 'DRAFT' ? 'Job draft saved successfully.' : 'Job published successfully.');
        setTimeout(() => navigate(`/recruiter/jobs/${createdJob.jobId}`), 500);
      }
    } catch (requestError) {
      console.error('Recruiter job mutation failed:', requestError);
      setError(requestError.response?.data?.message || 'Unable to save the job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="space-y-5"><CardSkeleton /><CardSkeleton /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/recruiter/jobs')}>Back to Jobs</Button>
      <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 p-6 text-white shadow-xl sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-100"><BriefcaseBusiness className="h-3.5 w-3.5" /> Recruiter Job Workspace</div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{isEditing ? 'Edit job posting' : 'Create a new job posting'}</h1>
        <p className="mt-2 text-sm text-slate-300">Keep the opportunity clear, searchable, and ready for the right FinTech candidates.</p>
      </div>
      {error && <Toast type="error" message={error} onClose={() => setError('')} duration={6000} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} />}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
        <JobForm initialJob={job} isSubmitting={isSubmitting} submitLabel={isEditing ? 'Save Changes' : 'Publish Job'} showPublish={!isEditing} onSubmit={handleSubmit} onCancel={() => navigate('/recruiter/jobs')} />
      </div>
    </div>
  );
};

export default RecruiterJobFormPage;
