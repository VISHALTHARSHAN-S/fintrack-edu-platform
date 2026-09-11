import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, clearError } from '../../features/auth/authSlice';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { MailCheck, RefreshCw, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { verificationPendingEmail, isLoading, error } = useSelector((state) => state.auth);

  const email = verificationPendingEmail || 'user@fintrack.edu';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    const result = await dispatch(verifyOtp({ email, otpCode }));
    if (verifyOtp.fulfilled.match(result)) {
      setSuccessMsg('Account verified successfully!');
      setTimeout(() => {
        const role = result.payload.user.role;
        if (role === 'mentor') navigate('/mentor/dashboard');
        else if (role === 'recruiter') navigate('/recruiter/dashboard');
        else navigate('/student/dashboard');
      }, 1000);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setSuccessMsg('A new 6-digit verification code has been sent to your email.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto ring-8 ring-brand-50/50">
          <MailCheck className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">Verify Your Account</h2>
          <p className="text-sm text-slate-500 mt-2">
            We've sent a 6-digit verification code to <span className="font-semibold text-slate-800">{email}</span>
          </p>
        </div>

        {error && <Toast type="error" message={error} onClose={() => dispatch(clearError())} />}
        {successMsg && <Toast type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 transition-all outline-none"
              />
            ))}
          </div>

          <p className="text-xs text-slate-400">
            For testing in development, use code: <span className="font-mono text-slate-700 font-bold">123456</span>
          </p>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            isDisabled={otp.join('').length !== 6}
            icon={ArrowRight}
            className="py-3"
          >
            Verify Account
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Didn't receive code?</span>
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-brand-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend Code
            </button>
          ) : (
            <span className="text-slate-400 font-medium">Resend in {timer}s</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
