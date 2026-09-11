import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-slate-800 shadow-lg shadow-emerald-500/10',
    error: 'border-red-200 bg-white text-slate-800 shadow-lg shadow-red-500/10',
    warning: 'border-amber-200 bg-white text-slate-800 shadow-lg shadow-amber-500/10',
    info: 'border-blue-200 bg-white text-slate-800 shadow-lg shadow-blue-500/10',
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border max-w-md w-full transition-all duration-300 transform translate-y-0 ${borders[type]}`}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
