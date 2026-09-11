import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto ring-8 ring-slate-50">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">404 Page Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Link to="/">
            <Button variant="primary" icon={Home}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
