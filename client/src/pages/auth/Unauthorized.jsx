import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/common/Button';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const getHomePath = () => {
    if (user?.role === 'mentor') return '/mentor/dashboard';
    if (user?.role === 'recruiter') return '/recruiter/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto ring-8 ring-red-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">403 — Unauthorized Access</h2>
          <p className="text-sm text-slate-500 mt-2">
            You do not have permission to view this page. Access is restricted based on your role ({user?.role || 'Guest'}).
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Link to={getHomePath()}>
            <Button variant="primary" icon={Home}>
              My Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
