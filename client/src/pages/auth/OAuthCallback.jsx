import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { completeGoogleLogin } from '../../features/auth/authSlice';

const OAuthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const token = hashParams.get('token');
    window.history.replaceState(null, '', '/oauth/callback');
    if (!token) {
      navigate('/login?oauthError=Google login did not return an application token', { replace: true });
      return;
    }

    dispatch(completeGoogleLogin(token)).then((result) => {
      if (completeGoogleLogin.fulfilled.match(result)) {
        const role = result.payload.user.role;
        navigate(role === 'mentor' ? '/mentor/dashboard' : role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard', { replace: true });
      } else {
        navigate('/login?oauthError=Google login could not be completed', { replace: true });
      }
    });
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-600">
      Completing Google sign in...
    </div>
  );
};

export default OAuthCallback;
