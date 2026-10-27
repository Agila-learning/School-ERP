import React, { useState, useEffect } from 'react';
import {
  Person as PersonIcon,
  AssignmentTurnedIn as TaskIcon,
  Schedule as ScheduleIcon,
  Notifications as NotifIcon,
  TrendingUp as TrendingIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon,
  PendingActions as PendingIcon,
  AccountBalance as FeeIcon,
  PersonAdd as AdmissionIcon,
  Event as EventIcon,
  ArrowForward as ArrowIcon,
  Campaign as CampaignIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../../core/api/axios';

const quickActions = [
  { label: 'Issue Bonafide', icon: WorkspacePremiumIcon, path: '/office/bonafide', color: 'bg-amber-600 hover:bg-amber-700' },
  { label: 'Office Circulars', icon: CampaignIcon, path: '/office/circulars', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { label: 'No Due Clearance', icon: WorkspacePremiumIcon, path: '/office/no-due', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'New Admission', icon: AdmissionIcon, path: '/admission/apply', color: 'bg-violet-600 hover:bg-violet-700' },
  { label: 'Collect Fee', icon: FeeIcon, path: '/finance/payments', color: 'bg-teal-600 hover:bg-teal-700' },
  { label: 'Issue Gate Pass', icon: TaskIcon, path: '/security/watchman', color: 'bg-blue-600 hover:bg-blue-700' },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

const OfficeDashboard: React.FC = () => {
  const [, setSelectedTask] = useState<number | null>(null);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Live Metrics State
  const [bonafideCount, setBonafideCount] = useState<number>(0);
  const [recentBonafides, setRecentBonafides] = useState<any[]>([]);
  const [pendingAdmissions, setPendingAdmissions] = useState<number>(0);
  const [feeCollected, setFeeCollected] = useState<number>(0);
  const [circularsCount, setCircularsCount] = useState<number>(0);
  const [noDueCount, setNoDueCount] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);

  useEffect(() => {
    // 1. Load Local Storage Certificate Counts
    try {
      const savedBonafide = localStorage.getItem('erp_office_bonafide_certificates');
      if (savedBonafide) {
        const parsed = JSON.parse(savedBonafide);
        if (Array.isArray(parsed)) {
          setBonafideCount(parsed.length);
          setRecentBonafides(parsed.slice(0, 3));
        }
      }
    } catch (e) {
      /* ignore parse error */
    }

    try {
      const savedNoDue = localStorage.getItem('erp_office_no_due_certificates');
      if (savedNoDue) {
        const parsed = JSON.parse(savedNoDue);
        if (Array.isArray(parsed)) {
          setNoDueCount(parsed.length);
        }
      }
    } catch (e) {
      /* ignore parse error */
    }

    // 2. Load Live Backend Summaries
    const loadData = async () => {
      try {
        const [feeRes, actRes, commRes] = await Promise.allSettled([
          api.get('/admin/dashboard/fees'),
          api.get('/admin/dashboard/activities'),
          api.get('/communication/announcements')
        ]);

        if (feeRes.status === 'fulfilled' && feeRes.value.data?.data) {
          setFeeCollected(feeRes.value.data.data.collected || 0);
        }
        if (actRes.status === 'fulfilled' && actRes.value.data?.data) {
          setRecentActivities(Array.isArray(actRes.value.data.data) ? actRes.value.data.data : []);
        }
        if (commRes.status === 'fulfilled' && commRes.value.data?.data) {
          setCircularsCount(Array.isArray(commRes.value.data.data) ? commRes.value.data.data.length : 0);
        }
      } catch (e) {
        /* fail gracefully */
      }
    };

    loadData();
  }, []);

  const statCards = [
    { label: 'Bonafide Certificates', value: `${bonafideCount} Issued`, icon: WorkspacePremiumIcon, gradient: 'from-amber-500 to-orange-600', text: 'text-amber-700', link: '/office/bonafide' },
    { label: 'Pending Admissions', value: pendingAdmissions, icon: AdmissionIcon, gradient: 'from-violet-500 to-purple-600', text: 'text-violet-700', link: '/admission/review' },
    { label: 'Fee Collections', value: `₹ ${feeCollected.toLocaleString('en-IN')}`, icon: FeeIcon, gradient: 'from-emerald-500 to-teal-600', text: 'text-emerald-700', link: '/finance/payments' },
    { label: 'Office Circulars', value: circularsCount, icon: CampaignIcon, gradient: 'from-indigo-500 to-blue-600', text: 'text-indigo-700', link: '/office/circulars' },
    { label: 'No Due Clearance', value: `${noDueCount} Issued`, icon: WorkspacePremiumIcon, gradient: 'from-emerald-500 to-teal-600', text: 'text-emerald-700', link: '/office/no-due' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h1 className="text-3xl font-bold mb-2">{greeting}, Office Team! 👋</h1>
            <p className="text-indigo-200 text-base">Here's what needs your attention today.</p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-center">
            <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
              <p className="text-2xl font-black">{pendingAdmissions}</p>
              <p className="text-xs text-indigo-200 mt-1">New Requests</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
              <p className="text-2xl font-black">{pendingTasks.length}</p>
              <p className="text-xs text-indigo-200 mt-1">Approvals Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, gradient, text, link }) => (
          <Link to={link} key={label} className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 no-underline">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="text-white" style={{ fontSize: 26 }} />
            </div>
            <div>
              <p className={`text-2xl font-black ${text}`}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
            <ArrowIcon className="ml-auto text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ label, icon: Icon, path, color }) => (
            <Link to={path} key={label} className="no-underline">
              <button className={`w-full flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-white ${color} transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95`}>
                <Icon style={{ fontSize: 28 }} />
                <span className="text-xs font-semibold text-center leading-tight">{label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Bonafide Certificate Generating Section ─── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <WorkspacePremiumIcon fontSize="medium" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Bonafide Certificate Generating Section</h2>
              <p className="text-xs text-gray-500">Fast student certification for passports, bank accounts, scholarships, and tax rebate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/office/bonafide" className="no-underline">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                <span>+ Generate Bonafide</span>
              </button>
            </Link>
            <Link to="/office/bonafide" className="no-underline">
              <button className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-all">
                View Full Registry &rarr;
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Issued Bonafide Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentBonafides.length === 0 ? (
            <div className="col-span-full p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <p className="text-sm font-bold text-gray-600">No bonafide certificates issued yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "+ Generate Bonafide" above to create and print verified certificates for enrolled students.</p>
            </div>
          ) : (
            recentBonafides.map((cert) => (
              <div key={cert.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{cert.purpose || 'Bonafide'}</span>
                  <p className="text-sm font-bold text-gray-900">{cert.studentName} ({cert.classGrade}-{cert.section})</p>
                  <p className="text-xs text-gray-400 font-mono">Ref: {cert.certificateNumber}</p>
                </div>
                <Link to="/office/bonafide" className="text-xs font-bold text-indigo-600 hover:underline">Print &rarr;</Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2"><TrendingIcon className="text-indigo-500" fontSize="small" /> Recent Activity</h2>
            <Link to="/admin/audit-logs" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm font-bold text-gray-600">No recent office activities</p>
                <p className="text-xs text-gray-400 mt-1">Audit events and transactions will automatically display here as operations occur.</p>
              </div>
            ) : (
              recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${a.status === 'done' || a.action?.includes('SUCCESS') ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {a.status === 'done' || a.action?.includes('SUCCESS') ? <CheckIcon style={{ fontSize: 14 }} /> : <PendingIcon style={{ fontSize: 14 }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium leading-snug">{a.action || a.description || a.details}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time || (a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2"><TaskIcon className="text-violet-500" fontSize="small" /> My Tasks</h2>
            <Link to="/operations/tasks" className="text-xs text-indigo-600 font-medium hover:underline">View Board</Link>
          </div>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm font-bold text-gray-600">No pending office tasks</p>
                <p className="text-xs text-gray-400 mt-1">All daily office operational tasks are currently cleared.</p>
              </div>
            ) : (
              pendingTasks.map((t, i) => (
                <div key={i}
                  onClick={() => setSelectedTask(i)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer transition-all group">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-indigo-400 flex-shrink-0 transition-colors" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium">{t.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <EventIcon style={{ fontSize: 12 }} className="text-gray-400" />
                      <p className="text-xs text-gray-400">Due: {t.due}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${priorityColors[t.priority]}`}>{t.priority}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/operations/tasks" className="flex items-center justify-center gap-2 text-sm text-indigo-600 font-medium hover:underline">
              <MoreIcon fontSize="small" /> View All Tasks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeDashboard;
