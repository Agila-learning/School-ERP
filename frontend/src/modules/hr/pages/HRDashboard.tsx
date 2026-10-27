import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/hr.api';

const StatCard: React.FC<{ title: string; value: string | number; color: string; icon: string }> = ({ title, value, color, icon }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const HRDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newJoiners: 0,
    openRequisitions: 0,
    activeCandidates: 0,
    onLeaveToday: 0,
    pendingExits: 0,
    departmentDistribution: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(data => {
      if (data) setStats(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="p-10 flex justify-center">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR & Staff Management</h1>
          <p className="text-sm text-gray-500">Overview of organization and employee lifecycle</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/hr/documents" className="px-3.5 py-2 bg-indigo-700 text-white rounded-lg text-sm font-bold hover:bg-indigo-800 flex items-center gap-1.5 shadow-sm">
            <span>📁</span> Staff Documents & Dossiers
          </Link>
          <Link to="/hr/employees" className="px-3.5 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-1.5 shadow-sm">
            <span>👥</span> Staff Directory
          </Link>
          <Link to="/hr/payroll" className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm">
            <span>💰</span> Process Payroll
          </Link>
          <Link to="/hr/approvals" className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5 shadow-sm">
            <span>📝</span> Leave Requests
          </Link>
          <Link to="/hr/recruitment" className="px-3.5 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 flex items-center gap-1.5 shadow-sm">
            <span>🎯</span> Recruitment Board
          </Link>
          <Link to="/hr/offboarding" className="px-3.5 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 flex items-center gap-1.5 shadow-sm">
            <span>👋</span> Resignations & Exits
          </Link>
          <Link to="/career/referrals" className="px-3.5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 flex items-center gap-1.5 shadow-sm">
            <span>🎁</span> Referral Rewards
          </Link>
          <Link to="/admin/users" className="px-3.5 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 flex items-center gap-1.5 shadow-sm">
            <span>🛡️</span> User Accounts
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard title="Total Staff" value={stats.totalEmployees} icon="👥" color="bg-blue-50 text-blue-600" />
        <StatCard title="New Joiners (M)" value={stats.newJoiners} icon="✨" color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Open Roles" value={stats.openRequisitions} icon="🎯" color="bg-indigo-50 text-indigo-600" />
        <StatCard title="Pipeline" value={stats.activeCandidates} icon="📥" color="bg-purple-50 text-purple-600" />
        <StatCard title="On Leave" value={stats.onLeaveToday} icon="🌴" color="bg-amber-50 text-amber-600" />
        <StatCard title="Pending Exits" value={stats.pendingExits} icon="👋" color="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Department Distribution</h2>
          <div className="space-y-4">
            {(stats.departmentDistribution || []).map((dept: any) => (
              <div key={dept.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{dept.name}</span>
                  <span className="text-gray-500">{dept.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${dept.color} h-2 rounded-full`} style={{ width: `${(dept.count / (stats.totalEmployees || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Pending Actions & Governance</h2>
            <Link to="/hr/approvals" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            <div className="p-3 border border-indigo-200 bg-indigo-50/60 rounded-lg flex justify-between items-center hover:bg-indigo-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">📁</div>
                <div>
                  <p className="text-sm font-bold text-indigo-950">Staff Documents Vault & Dossiers</p>
                  <p className="text-xs text-indigo-700">Download individual credentials or whole PDF personnel dossiers</p>
                </div>
              </div>
              <Link to="/hr/documents" className="text-sm text-indigo-700 font-bold hover:underline">Open Vault &rarr;</Link>
            </div>

            <div className="p-3 border border-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">🛡️</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">User Account Controls</p>
                  <p className="text-xs text-gray-500">Activate, deactivate, and assign staff roles</p>
                </div>
              </div>
              <Link to="/admin/users" className="text-sm text-indigo-600 font-medium hover:underline">Manage Access</Link>
            </div>

            <div className="p-3 border border-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">👋</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Resignation & Offboarding Desk</p>
                  <p className="text-xs text-gray-500">{stats.pendingExits || 0} Pending resignation approvals & clearances</p>
                </div>
              </div>
              <Link to="/hr/offboarding" className="text-sm text-indigo-600 font-medium hover:underline">Review Flow</Link>
            </div>

            <div className="p-3 border border-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">🌴</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Staff Leave Requests</p>
                  <p className="text-xs text-gray-500">Require supervisor & HR sign-off</p>
                </div>
              </div>
              <Link to="/hr/approvals" className="text-sm text-indigo-600 font-medium hover:underline">Review</Link>
            </div>

            <div className="p-3 border border-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">💰</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payroll Cycle Desk</p>
                  <p className="text-xs text-gray-500">Monthly salary calculation, LOP reconciliation & Excel export</p>
                </div>
              </div>
              <Link to="/hr/payroll" className="text-sm text-indigo-600 font-medium hover:underline">Process</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
