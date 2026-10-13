import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, BadgeCheck, ShieldCheck, XCircle } from 'lucide-react';
import { verifyCertificate } from '../services/certificateService';

const CertificateVerificationPage = () => {
  const { verificationId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    verifyCertificate(verificationId)
      .then((data) => {
        if (isMounted) setResult(data);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [verificationId]);

  const status = result?.status;
  const icon = status === 'valid' ? BadgeCheck : status === 'revoked' || status === 'not-found' ? XCircle : AlertCircle;
  const Icon = icon;
  const color = status === 'valid' ? 'text-emerald-600 bg-emerald-50' : status ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50';
  const heading = status === 'valid' ? 'Certificate verified' : status === 'revoked' ? 'Certificate revoked' : status === 'not-found' ? 'Certificate not found' : 'Verification unavailable';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
        <div className="flex items-center gap-2 text-sm font-bold text-brand-700">
          <ShieldCheck className="h-5 w-5" /> FinTrack Edu
        </div>
        <div className="mt-8 text-center">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${color}`}>
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">{isLoading ? 'Checking credential...' : heading}</h1>
          {isLoading && <p className="mt-2 text-sm text-slate-500">Looking up the public verification record.</p>}
          {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
          {!isLoading && status === 'valid' && (
            <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 text-left">
              <p className="text-sm text-emerald-800">This credential is currently valid in the FinTrack Edu records.</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Course</dt><dd className="mt-0.5 font-semibold text-slate-900">{result.courseTitle}</dd></div>
                <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Certificate number</dt><dd className="mt-0.5 break-all font-mono text-slate-900">{result.certificateNumber}</dd></div>
                <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Issued by</dt><dd className="mt-0.5 text-slate-900">{result.issuingOrganization}</dd></div>
                <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Issue date</dt><dd className="mt-0.5 text-slate-900">{new Date(result.issueDate).toLocaleDateString()}</dd></div>
              </dl>
            </div>
          )}
          {!isLoading && status === 'revoked' && (
            <p className="mx-auto mt-4 max-w-lg text-sm text-slate-600">This credential is no longer valid. Do not rely on it as proof of completion.</p>
          )}
          {!isLoading && status === 'not-found' && (
            <p className="mx-auto mt-4 max-w-lg text-sm text-slate-600">No credential matches this verification link. Check the URL or contact the issuing organization.</p>
          )}
          <Link to="/" className="mt-8 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Go to FinTrack Edu</Link>
        </div>
      </section>
    </main>
  );
};

export default CertificateVerificationPage;
