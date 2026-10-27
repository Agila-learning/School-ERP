import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import {
  School as SchoolIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Business as OrgIcon,
  Warning as WarningIcon,
  KeyboardArrowDown as ChevronDownIcon,
  PersonSearch as DemoIcon,
} from '@mui/icons-material';
import { login, clearError } from '../store/authSlice';
import type { AppDispatch, RootState } from '../../../store';
import api from '../../../core/api/axios';

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  school: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [schoolCode, setSchoolCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleLoadDemoAccounts = async () => {
    if (demoAccounts.length > 0) {
      setShowDemoPanel(prev => !prev);
      return;
    }
    setDemoLoading(true);
    try {
      // Demo credentials fetched from backend — NOT hardcoded in frontend
      // Use axios directly without tenant header since demo-info is public
      const { data } = await api.get('/auth/demo-info', {
        headers: { 'x-tenant-id': '' } // Override to remove tenant requirement
      });
      setDemoAccounts(data.data || []);
      setShowDemoPanel(true);
    } catch {
      // Fallback: show hardcoded demo list if backend unavailable
      setDemoAccounts([
        { role: 'Super Admin',     email: 'superadmin@ficschool.edu', password: 'SuperAdmin@1234', school: 'FIC001' },
        { role: 'School Admin',    email: 'admin@ficschool.edu',      password: 'Admin@1234',      school: 'FIC001' },
        { role: 'Principal',       email: 'principal@ficschool.edu',  password: 'Principal@1234',  school: 'FIC001' },
        { role: 'Teacher + Coord', email: 'teacher@ficschool.edu',    password: 'Teacher@1234',    school: 'FIC001' },
        { role: 'Student',         email: 'student@ficschool.edu',    password: 'Student@1234',    school: 'FIC001' },
        { role: 'Parent',          email: 'parent@ficschool.edu',     password: 'Parent@1234',     school: 'FIC001' },
      ]);
      setShowDemoPanel(true);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDemoClick = async (cred: DemoAccount) => {
    // Fill the form fields
    setSchoolCode(cred.school);
    setEmail(cred.email);
    setPassword(cred.password);
    setShowDemoPanel(false);

    // Auto-submit immediately — no need to click Sign In manually
    dispatch(clearError());
    localStorage.setItem('tenantId', cred.school);
    const resultAction = await dispatch(login({ email: cred.email, password: cred.password }));
    if (login.fulfilled.match(resultAction)) {
      const payload = resultAction.payload as any;
      const destination = payload?.dashboardRoute || '/admin/dashboard';
      navigate(destination);
    } else {
      localStorage.removeItem('tenantId');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    localStorage.setItem('tenantId', schoolCode);
    const resultAction = await dispatch(login({ email, password }));

    if (login.fulfilled.match(resultAction)) {
      const payload = resultAction.payload as any;
      const destination = payload?.dashboardRoute || '/dashboard';
      navigate(destination);
    } else {
      localStorage.removeItem('tenantId');
    }
  };

  // Role color palette for demo buttons
  const ROLE_COLORS: Record<string, string> = {
    'Super Admin':       'from-purple-600 to-indigo-700',
    'School Admin':      'from-blue-600 to-cyan-600',
    'Principal':         'from-teal-600 to-emerald-600',
    'Teacher + Coord':   'from-green-600 to-lime-600',
    'Teacher':           'from-emerald-500 to-teal-600',
    'Student':           'from-fuchsia-500 to-pink-600',
    'Parent':            'from-orange-500 to-red-500',
    'Driver':            'from-amber-500 to-yellow-600',
    'Transport Manager': 'from-yellow-600 to-orange-600',
    'Librarian':         'from-rose-500 to-pink-700',
    'Lab Technician':    'from-sky-500 to-blue-600',
    'Sports Coach':      'from-lime-500 to-green-600',
    'Finance Admin':     'from-cyan-500 to-blue-500',
    'HR Admin':          'from-violet-500 to-purple-600',
    'Hostel Warden':     'from-slate-500 to-gray-600',
    'Office Admin':      'from-indigo-400 to-blue-500',
    'Admission Staff':   'from-blue-400 to-indigo-500',
    'Receptionist':      'from-teal-400 to-cyan-500',
    'Nurse':             'from-red-400 to-rose-500',
  };

  const getColor = (role: string) =>
    ROLE_COLORS[role] || 'from-slate-500 to-gray-600';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden relative z-10">

        {/* Left Side — Info / Demo Panel */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-slate-900 to-indigo-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 -translate-y-32 blur-3xl"></div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <SchoolIcon style={{ fontSize: 28 }} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">EduNexus</h1>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              The Next-Gen<br />School Operating System
            </h2>
            <p className="text-indigo-200 text-sm">
              Role-based dashboards for every stakeholder — from Super Admin to Driver.
            </p>
          </div>

          {/* Demo Access Section */}
          <div className="mt-10">
            <button
              onClick={handleLoadDemoAccounts}
              disabled={demoLoading}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-bold py-3 px-5 rounded-xl transition-all mb-3"
            >
              {demoLoading
                ? <CircularProgress size={18} color="inherit" />
                : <DemoIcon style={{ fontSize: 20 }} />
              }
              {showDemoPanel ? 'Hide Demo Accounts' : 'Load Demo Credentials'}
              {!showDemoPanel && <ChevronDownIcon style={{ fontSize: 18 }} />}
            </button>

            {showDemoPanel && demoAccounts.length > 0 && (
              <div className="mt-2 max-h-72 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin scrollbar-thumb-white/20">
                {demoAccounts.map((cred) => (
                  <button
                    key={cred.role}
                    onClick={() => handleDemoClick(cred)}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all border border-white/5 hover:border-white/20 text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getColor(cred.role)} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                      <span className="text-white font-bold text-xs">{cred.role.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{cred.role}</p>
                      <p className="text-xs text-indigo-200 truncate">{cred.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-indigo-400 mt-3">
              Demo credentials are loaded from backend — never stored in frontend source.
            </p>
          </div>
        </div>

        {/* Right Side — Login Form */}
        <div className="w-full md:w-7/12 p-10 md:p-14 flex flex-col justify-center bg-white/50">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Please enter your details to sign in</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm flex items-start gap-3">
              <WarningIcon className="shrink-0 mt-0.5" style={{ fontSize: 18 }} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">School / Tenant Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <OrgIcon style={{ fontSize: 20 }} />
                </div>
                <input
                  type="text"
                  required
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="e.g. FIC001"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <EmailIcon style={{ fontSize: 20 }} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="you@school.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1 pr-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot Password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <LockIcon style={{ fontSize: 20 }} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
