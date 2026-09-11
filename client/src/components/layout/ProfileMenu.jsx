import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getProfilePath = () => {
    if (user?.role === 'mentor') return '/mentor/settings';
    if (user?.role === 'recruiter') return '/recruiter/settings';
    return '/student/settings';
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors focus:outline-none cursor-pointer"
      >
        <Avatar name={user?.name || 'User'} size="sm" />
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {user?.name || 'Vishaltharshan S'}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 capitalize font-medium">
              {user?.role || 'Student'}
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="p-3 border-b border-slate-100 mb-1">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'Vishaltharshan S'}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || 'student@fintrack.edu'}</p>
            <div className="mt-2">
              <Badge variant="brand" size="sm" className="capitalize">
                <Shield className="w-3 h-3 mr-1 inline" /> {user?.role || 'student'} Account
              </Badge>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(getProfilePath());
              }}
              className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(getProfilePath());
              }}
              className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & Privacy</span>
            </button>
          </div>

          {/* Logout Action */}
          <div className="pt-1 mt-1 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
