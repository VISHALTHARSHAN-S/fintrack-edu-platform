import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-6">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Check Your Email</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We've sent password reset instructions to <span className="font-semibold text-slate-800">{email}</span>.
            </p>
            <Link to="/reset-password">
              <Button variant="primary" fullWidth className="mt-4">
                Proceed to Reset Password
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your registered email address and we'll send you a password reset link.
              </p>
            </div>

            {error && <Toast type="error" message={error} onClose={() => setError('')} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                icon={Mail}
                required
              />

              <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="py-3">
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
