import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  BadgeCheck,
  BookCheck,
  CalendarDays,
  Download,
  ExternalLink,
  Eye,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  downloadCertificatePdf,
  fetchCertificateEligibility,
  fetchCertificates,
  issueCourseCertificate,
} from '../../services/certificateService';

const getCourseTitle = (certificate) =>
  certificate.metadata?.courseTitle || certificate.courseId?.title || 'Course certificate';

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const StudentCertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [issuingCourseId, setIssuingCourseId] = useState('');
  const [downloadingId, setDownloadingId] = useState('');
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [issueMonth, setIssueMonth] = useState('');

  const loadCertificates = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [certificateData, eligibilityData] = await Promise.all([
        fetchCertificates(),
        fetchCertificateEligibility(),
      ]);
      setCertificates(certificateData);
      setEligibleCourses(eligibilityData);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const courseOptions = useMemo(
    () => [...new Set(certificates.map(getCourseTitle))].sort((a, b) => a.localeCompare(b)),
    [certificates]
  );

  const filteredCertificates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return certificates.filter((certificate) => {
      const title = getCourseTitle(certificate);
      const matchesSearch =
        !normalizedSearch ||
        title.toLowerCase().includes(normalizedSearch) ||
        certificate.certificateNumber.toLowerCase().includes(normalizedSearch);
      const matchesCourse = courseFilter === 'all' || title === courseFilter;
      const matchesStatus = statusFilter === 'all' || certificate.status === statusFilter;
      const matchesMonth =
        !issueMonth || new Date(certificate.issueDate).toISOString().slice(0, 7) === issueMonth;
      return matchesSearch && matchesCourse && matchesStatus && matchesMonth;
    });
  }, [certificates, courseFilter, issueMonth, search, statusFilter]);

  const handleIssue = async (course) => {
    setIssuingCourseId(String(course.courseId));
    setActionError('');
    setSuccessMessage('');
    try {
      await issueCourseCertificate(course.courseId);
      setSuccessMessage(`Your certificate for ${course.courseTitle} is ready.`);
      await loadCertificates();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIssuingCourseId('');
    }
  };

  const handleDownload = async (certificate) => {
    setDownloadingId(certificate._id);
    setActionError('');
    try {
      await downloadCertificatePdf(certificate._id, certificate.certificateNumber);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setDownloadingId('');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5" aria-live="polite">
        <div className="h-36 animate-pulse rounded-3xl bg-white shadow-sm" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
        <p className="text-center text-sm text-slate-500">Loading your certificates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
            <ShieldCheck className="h-4 w-4" /> Verifiable learning credentials
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Your certificates</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            View course achievements, download signed-looking PDF credentials, and let anyone verify
            their authenticity using the certificate QR code.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-200">
            <Award className="h-5 w-5 text-amber-300" />
            <span>{certificates.length} certificate{certificates.length === 1 ? '' : 's'} earned</span>
          </div>
        </div>
        <Award className="absolute -bottom-8 -right-3 h-48 w-48 text-white/[0.06] sm:right-10" />
      </section>

      {loadError && (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{loadError}</span>
          <button onClick={loadCertificates} className="font-semibold underline">Try again</button>
        </div>
      )}
      {actionError && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
        </div>
      )}
      {successMessage && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <BadgeCheck className="h-4 w-4 shrink-0" />{successMessage}
        </div>
      )}

      {eligibleCourses.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Completed courses</h2>
            <p className="mt-1 text-sm text-slate-500">Certificates are issued after course and required assessment checks.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {eligibleCourses.map((course) => (
              <div key={course.courseId} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <BookCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{course.courseTitle}</h3>
                    {course.alreadyIssued ? (
                      <p className="mt-1 text-xs font-medium text-emerald-700">Certificate already issued</p>
                    ) : course.missingAssessmentIds.length > 0 ? (
                      <p className="mt-1 text-xs text-amber-700">
                        Pass required assessment{course.missingAssessmentIds.length === 1 ? '' : 's'}: {course.missingAssessmentIds.join(', ')}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">Course completion verified</p>
                    )}
                  </div>
                </div>
                {course.eligible && (
                  <button
                    onClick={() => handleIssue(course)}
                    disabled={Boolean(issuingCourseId)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    <Award className="h-4 w-4" />
                    {issuingCourseId === String(course.courseId) ? 'Issuing...' : 'Issue certificate'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Earned credentials</h2>
            <p className="mt-1 text-sm text-slate-500">Search, filter, preview, and download your credentials.</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Search certificates</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search course or number"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label>
            <span className="sr-only">Filter by course</span>
            <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500">
              <option value="all">All courses</option>
              {courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500">
              <option value="all">All statuses</option>
              <option value="valid">Valid</option>
              <option value="revoked">Revoked</option>
            </select>
          </label>
          <label className="relative">
            <span className="sr-only">Filter by issue month</span>
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="month" value={issueMonth} onChange={(event) => setIssueMonth(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-brand-500" />
          </label>
        </div>

        {filteredCertificates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <Award className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-800">
              {certificates.length ? 'No certificates match these filters' : 'No certificates yet'}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              {certificates.length
                ? 'Try changing your search or filters.'
                : 'Once you complete an eligible course, your issued credential will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCertificates.map((certificate) => {
              const title = getCourseTitle(certificate);
              const valid = certificate.status === 'valid';
              return (
                <article key={certificate._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/60 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
                      <Award className="h-5 w-5" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${valid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${valid ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      {valid ? 'Valid credential' : 'Revoked'}
                    </span>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="min-h-14">
                      <h3 className="font-bold leading-snug text-slate-900">{title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{certificate.metadata?.issuingOrganization || 'FinTrack Edu'}</p>
                    </div>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />Issued {formatDate(certificate.issueDate)}</p>
                      <p className="truncate font-mono text-[11px] text-slate-500" title={certificate.certificateNumber}>
                        No. {certificate.certificateNumber}
                      </p>
                    </div>
                    <div className="flex gap-2 border-t border-slate-100 pt-4">
                      <button onClick={() => setPreview(certificate)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                        <Eye className="h-4 w-4" /> Preview
                      </button>
                      <button
                        onClick={() => handleDownload(certificate)}
                        disabled={!valid || Boolean(downloadingId)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />{downloadingId === certificate._id ? 'Preparing...' : 'Download'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {preview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setPreview(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="certificate-preview-title" className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setPreview(null)} aria-label="Close certificate preview" className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <div className="rounded-2xl border-2 border-amber-200 bg-slate-50 p-6 text-center sm:p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700"><Award className="h-6 w-6" /></div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-700">{preview.metadata?.issuingOrganization || 'FinTrack Edu'}</p>
              <h2 id="certificate-preview-title" className="mt-2 text-2xl font-extrabold text-slate-900">Certificate of Completion</h2>
              <p className="mt-3 text-sm text-slate-500">Awarded to {preview.metadata?.studentName || 'the learner'} for successfully completing</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{getCourseTitle(preview)}</p>
              <div className="mt-5 space-y-1 text-xs text-slate-500">
                <p>Issued {formatDate(preview.issueDate)}</p>
                <p className="font-mono">{preview.certificateNumber}</p>
              </div>
              <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${preview.status === 'valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {preview.status === 'valid' ? 'Valid' : 'Revoked'}
              </span>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to={`/verify/${encodeURIComponent(preview.verificationId)}`} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <ExternalLink className="h-4 w-4" /> Public verification
              </Link>
              <button onClick={() => handleDownload(preview)} disabled={preview.status !== 'valid'} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default StudentCertificatesPage;
