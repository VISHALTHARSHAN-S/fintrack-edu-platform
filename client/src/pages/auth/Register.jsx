import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { completeGoogleRegistration, register, clearError, setVerificationEmail } from '../../features/auth/authSlice';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { Sparkles, Mail, Lock, User, Phone, GraduationCap, Users, Briefcase } from 'lucide-react';

const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z" />
    <path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.6Z" />
    <path fill="#FBBC05" d="M6.53 13.68A5.85 5.85 0 0 1 6.22 12c0-.58.1-1.15.31-1.68V7.79H3.28A9.73 9.73 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.21l3.25-2.53Z" />
    <path fill="#EA4335" d="M12 6.29c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53C7.3 8.01 9.46 6.29 12 6.29Z" />
  </svg>
);

const decodeRegistrationTicket = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.type === 'google_registration' ? payload : null;
  } catch {
    return null;
  }
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [role, setRole] = useState('student');
  const [googleRegistrationToken, setGoogleRegistrationToken] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    institution: '', degree: '', yearOfStudy: '', designation: '', company: '', expertise: '',
    companyName: '', industry: '', companySize: '', agreeTerms: false,
  });
  const oauthError = searchParams.get('oauthError');

  useEffect(() => {
    const registrationToken = new URLSearchParams(window.location.hash.slice(1)).get('registration_token');
    if (!registrationToken) return;
    const ticket = decodeRegistrationTicket(registrationToken);
    window.history.replaceState(null, '', '/register');
    if (!ticket || !['student', 'mentor', 'recruiter'].includes(ticket.role)) {
      setValidationError('The Google registration session is invalid. Please try again.');
      return;
    }
    setGoogleRegistrationToken(registrationToken);
    setRole(ticket.role);
    setFormData((previous) => ({ ...previous, name: ticket.name || '', email: ticket.email || '' }));
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    setValidationError('');
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!googleRegistrationToken && formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (!formData.agreeTerms) {
      setValidationError('Please agree to the Terms of Service');
      return;
    }

    const payload = {
      role, name: formData.name, email: formData.email, phone: formData.phone,
      ...(googleRegistrationToken ? { registrationToken: googleRegistrationToken } : { password: formData.password }),
      ...(role === 'student' && { institution: formData.institution, degree: formData.degree, yearOfStudy: formData.yearOfStudy }),
      ...(role === 'mentor' && { designation: formData.designation, company: formData.company, expertise: formData.expertise }),
      ...(role === 'recruiter' && { companyName: formData.companyName, industry: formData.industry, companySize: formData.companySize }),
    };

    const action = googleRegistrationToken ? completeGoogleRegistration : register;
    const result = await dispatch(action(payload));
    if (googleRegistrationToken && completeGoogleRegistration.fulfilled.match(result)) {
      const completedRole = result.payload.user.role;
      navigate(completedRole === 'mentor' ? '/mentor/dashboard' : completedRole === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard');
    } else if (!googleRegistrationToken && register.fulfilled.match(result)) {
      dispatch(setVerificationEmail(formData.email));
      navigate('/verify-otp');
    }
  };

  const handleGoogleRegistration = () => {
    setGoogleLoading(true);
    window.location.assign(`/api/auth/google?role=${encodeURIComponent(role)}`);
  };

  const passwordStrength = !formData.password ? null : formData.password.length < 6 ? ['Weak', 'bg-red-500'] : formData.password.length < 10 ? ['Medium', 'bg-amber-500'] : ['Strong', 'bg-emerald-500'];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-10 my-8">
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-brand-500/20"><Sparkles className="w-6 h-6" /></div>
          <h2 className="text-2xl font-bold text-slate-900">Create FinTrack Account</h2>
          <p className="text-sm text-slate-500 mt-1">Select your account role to get started</p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto mb-8 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200">
          {[{ id: 'student', label: 'Student', icon: GraduationCap }, { id: 'mentor', label: 'Mentor', icon: Users }, { id: 'recruiter', label: 'Recruiter', icon: Briefcase }].map((item) => {
            const Icon = item.icon;
            return <button key={item.id} type="button" disabled={Boolean(googleRegistrationToken)} onClick={() => setRole(item.id)} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed ${role === item.id ? 'bg-white text-brand-600 shadow-md shadow-slate-200/50' : 'text-slate-600 hover:text-slate-900'}`}><Icon className="w-4 h-4" /><span>{item.label}</span></button>;
          })}
        </div>

        {(error || validationError || oauthError) && <div className="mb-6 max-w-xl mx-auto"><Toast type="error" message={validationError || error || oauthError} onClose={() => { setValidationError(''); dispatch(clearError()); }} /></div>}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Vishaltharshan S" icon={User} required />
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" icon={Mail} required readOnly={Boolean(googleRegistrationToken)} />
          </div>
          <Input label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" icon={Phone} />

          {role === 'student' && <div className="p-4 rounded-2xl bg-brand-50/40 border border-brand-100 space-y-4"><p className="text-xs font-bold text-brand-700 uppercase tracking-wider">Academic Information</p><div className="grid sm:grid-cols-2 gap-4"><Input label="Institution / University" name="institution" value={formData.institution} onChange={handleChange} placeholder="Anna University / College Name" /><Select label="Degree Program" name="degree" value={formData.degree} onChange={handleChange} options={[{ value: 'B.Tech FinTech & CS', label: 'B.Tech FinTech & CS' }, { value: 'B.E. Computer Science', label: 'B.E. Computer Science' }, { value: 'MBA Finance & Analytics', label: 'MBA Finance & Analytics' }, { value: 'B.Com Financial Technologies', label: 'B.Com Financial Technologies' }]} /></div></div>}
          {role === 'mentor' && <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4"><p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Professional Mentorship Profile</p><div className="grid sm:grid-cols-2 gap-4"><Input label="Current Designation" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Principal Quant Architect" /><Input label="Company / Organization" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. Apex Trading Tech" /></div></div>}
          {role === 'recruiter' && <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4"><p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Company Information</p><div className="grid sm:grid-cols-2 gap-4"><Input label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Nexus Financial Solutions" /><Select label="Industry Sector" name="industry" value={formData.industry} onChange={handleChange} options={[{ value: 'Algorithmic Trading & Hedge Fund', label: 'Algorithmic Trading & Hedge Fund' }, { value: 'Digital Banking & Payments', label: 'Digital Banking & Payments' }, { value: 'RegTech & Compliance', label: 'RegTech & Compliance' }, { value: 'Blockchain & Web3 Finance', label: 'Blockchain & Web3 Finance' }]} /></div></div>}

          {!googleRegistrationToken && <div className="grid sm:grid-cols-2 gap-4"><div className="space-y-1"><Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" icon={Lock} required />{passwordStrength && <div className="flex items-center gap-2 pt-1"><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${passwordStrength[1]} w-full transition-all`} /></div><span className="text-[10px] font-semibold text-slate-500">{passwordStrength[0]}</span></div>}</div><Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" icon={Lock} required /></div>}
          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-2"><input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /><span>I agree to the <a href="#" className="text-brand-600 font-semibold underline">Terms of Service</a> and Privacy Policy.</span></label>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="py-3 mt-4">{googleRegistrationToken ? 'Complete Google Registration' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}</Button>
        </form>

        {!googleRegistrationToken && <div className="max-w-2xl mx-auto mt-4"><Button type="button" variant="secondary" fullWidth isLoading={googleLoading} icon={GoogleIcon} onClick={handleGoogleRegistration} className="py-3">Continue with Google</Button></div>}
        <p className="text-center text-xs text-slate-500 mt-6">Already registered? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in to existing account</Link></p>
      </div>
    </div>
  );
};

export default Register;
