import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError, setVerificationEmail } from '../../features/auth/authSlice';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { Sparkles, Mail, Lock, User, Phone, GraduationCap, Users, Briefcase, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Student specific
    institution: '',
    degree: '',
    yearOfStudy: '',
    // Mentor specific
    designation: '',
    company: '',
    expertise: '',
    // Recruiter specific
    companyName: '',
    industry: '',
    companySize: '',
    agreeTerms: false,
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setValidationError('');
    if (error) dispatch(clearError());
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    if (pwd.length < 6) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (pwd.length < 10) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setValidationError('Please agree to the Terms of Service');
      return;
    }

    const payload = {
      role,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      ...(role === 'student' && {
        institution: formData.institution,
        degree: formData.degree,
        yearOfStudy: formData.yearOfStudy,
      }),
      ...(role === 'mentor' && {
        designation: formData.designation,
        company: formData.company,
        expertise: formData.expertise,
      }),
      ...(role === 'recruiter' && {
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
      }),
    };

    const result = await dispatch(register(payload));
    if (register.fulfilled.match(result)) {
      dispatch(setVerificationEmail(formData.email));
      navigate('/verify-otp');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-10 my-8">
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-brand-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create FinTrack Account</h2>
          <p className="text-sm text-slate-500 mt-1">Select your account role to get started</p>
        </div>

        {/* ROLE SELECTION PILLS */}
        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto mb-8 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200">
          {[
            { id: 'student', label: 'Student', icon: GraduationCap },
            { id: 'mentor', label: 'Mentor', icon: Users },
            { id: 'recruiter', label: 'Recruiter', icon: Briefcase },
          ].map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-brand-600 shadow-md shadow-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {(error || validationError) && (
          <div className="mb-6 max-w-xl mx-auto">
            <Toast
              type="error"
              message={validationError || error}
              onClose={() => {
                setValidationError('');
                dispatch(clearError());
              }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
          {/* COMMON FIELDS */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Vishaltharshan S"
              icon={User}
              required
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              icon={Mail}
              required
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            icon={Phone}
          />

          {/* DYNAMIC ROLE-SPECIFIC FIELDS */}
          {role === 'student' && (
            <div className="p-4 rounded-2xl bg-brand-50/40 border border-brand-100 space-y-4">
              <p className="text-xs font-bold text-brand-700 uppercase tracking-wider">Academic Information</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Institution / University"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Anna University / College Name"
                />
                <Select
                  label="Degree Program"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  options={[
                    { value: 'B.Tech FinTech & CS', label: 'B.Tech FinTech & CS' },
                    { value: 'B.E. Computer Science', label: 'B.E. Computer Science' },
                    { value: 'MBA Finance & Analytics', label: 'MBA Finance & Analytics' },
                    { value: 'B.Com Financial Technologies', label: 'B.Com Financial Technologies' },
                  ]}
                />
              </div>
            </div>
          )}

          {role === 'mentor' && (
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Professional Mentorship Profile</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Current Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Principal Quant Architect"
                />
                <Input
                  label="Company / Organization"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Apex Trading Tech"
                />
              </div>
            </div>
          )}

          {role === 'recruiter' && (
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Company Information</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Nexus Financial Solutions"
                />
                <Select
                  label="Industry Sector"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  options={[
                    { value: 'Algorithmic Trading & Hedge Fund', label: 'Algorithmic Trading & Hedge Fund' },
                    { value: 'Digital Banking & Payments', label: 'Digital Banking & Payments' },
                    { value: 'RegTech & Compliance', label: 'RegTech & Compliance' },
                    { value: 'Blockchain & Web3 Finance', label: 'Blockchain & Web3 Finance' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* PASSWORD & CONFIRM PASSWORD */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
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
              {formData.password && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${pwdStrength.color} transition-all w-${pwdStrength.score}/3`} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{pwdStrength.label}</span>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              required
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              I agree to the <a href="#" className="text-brand-600 font-semibold underline">Terms of Service</a> and Privacy Policy.
            </span>
          </label>

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="py-3 mt-4">
            Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in to existing account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
