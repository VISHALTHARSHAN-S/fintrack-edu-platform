import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login, clearError } from '../../features/auth/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { Sparkles, Mail, Lock, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z" />
    <path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.6Z" />
    <path fill="#FBBC05" d="M6.53 13.68A5.85 5.85 0 0 1 6.22 12c0-.58.1-1.15.31-1.68V7.79H3.28A9.73 9.73 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.21l3.25-2.53Z" />
    <path fill="#EA4335" d="M12 6.29c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53C7.3 8.01 9.46 6.29 12 6.29Z" />
  </svg>
);

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error } = useSelector((state) => state.auth);
  const oauthError = searchParams.get('oauthError');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    const result = await dispatch(login({ email: formData.email, password: formData.password }));
    if (login.fulfilled.match(result)) {
      const userRole = result.payload.user.role;
      if (userRole === 'mentor') navigate('/mentor/dashboard');
      else if (userRole === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/student/dashboard');
    }
  };

  // Quick fill for dev convenience
  const handleQuickLogin = (email, role) => {
    setFormData({ email, password: 'Password123!', rememberMe: true });
    dispatch(login({ email, password: 'Password123!' })).then((res) => {
      if (login.fulfilled.match(res)) {
        if (role === 'mentor') navigate('/mentor/dashboard');
        else if (role === 'recruiter') navigate('/recruiter/dashboard');
        else navigate('/student/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid lg:grid-cols-12">
        {/* LEFT PANEL BRANDING */}
        <div className="lg:col-span-5 bg-gradient-to-br from-navy-950 via-slate-900 to-brand-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-purple flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">FinTrack<span className="text-brand-400">Edu</span></span>
            </Link>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-medium backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-brand-400" /> Naan Mudhalvan Ecosystem
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Welcome Back to Your FinTech Journey
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Access your verified skill passport, interactive quant modules, and 1-on-1 mentor sessions.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Role-Based Access Control</p>
                <p className="text-[11px] text-slate-400">Student, Mentor & Recruiter Secured Portals</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL LOGIN FORM */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Sign in to FinTrack</h3>
              <p className="text-sm text-slate-500 mt-1">Please enter your credentials to access your account</p>
            </div>

            {(error || oauthError) && (
              <Toast type="error" message={error || oauthError} onClose={() => dispatch(clearError())} duration={5000} />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@fintrack.edu"
                icon={Mail}
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-brand-600 hover:text-brand-700 font-semibold">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                icon={ArrowRight}
                className="py-3"
              >
                Sign In
              </Button>
            </form>

            <div className="relative flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              isLoading={isLoading}
              icon={GoogleIcon}
              onClick={() => window.location.assign('/api/auth/google')}
              className="py-3"
            >
              Continue with Google
            </Button>

            {/* Quick Demo Credentials Box for Dev Ease */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Quick Demo Login Test Accounts
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student@fintrack.edu', 'student')}
                  className="py-2 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-slate-800 font-medium hover:text-brand-600 transition-colors shadow-2xs"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('mentor@fintrack.edu', 'mentor')}
                  className="py-2 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-slate-800 font-medium hover:text-brand-600 transition-colors shadow-2xs"
                >
                  Mentor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('recruiter@fintrack.edu', 'recruiter')}
                  className="py-2 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-slate-800 font-medium hover:text-brand-600 transition-colors shadow-2xs"
                >
                  Recruiter
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
