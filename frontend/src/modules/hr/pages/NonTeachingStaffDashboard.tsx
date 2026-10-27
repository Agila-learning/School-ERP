import React, { useState, useEffect } from 'react';
import {
  Schedule as ScheduleIcon,
  Assignment as TaskIcon,
  EventAvailable as LeaveIcon,
  Payments as PayslipIcon,
  NotificationsActive as AlertIcon,
  WorkHistory as AttendanceIcon,
  CalendarMonth as CalIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  CardGiftcard as GiftIcon,
  HelpOutlined as HelpIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { QuickLeaveRequestModal } from '../../../shared/components/QuickLeaveRequestModal';
import { PrincipalQueryModal } from '../../../shared/components/PrincipalQueryModal';
import api from '../../../core/api/axios';

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

const NonTeachingStaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [queryModalOpen, setQueryModalOpen] = useState(false);

  const [stats, setStats] = useState({
    daysPresent: 0,
    totalWorkingDays: 0,
    leaveBalance: 0,
    totalLeaves: 0,
    tasksPending: 0,
    pendingPayslips: 0
  });

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [checkedIn, setCheckedIn] = useState<boolean>(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [commRes, leaveRes] = await Promise.allSettled([
          api.get('/communication/announcements'),
          api.get('/hr/leaves/my-summary')
        ]);

        if (commRes.status === 'fulfilled' && commRes.value.data?.data) {
          const items = Array.isArray(commRes.value.data.data) ? commRes.value.data.data : [];
          setAnnouncements(items.slice(0, 5));
        }

        if (leaveRes.status === 'fulfilled' && leaveRes.value.data?.data) {
          const lData = leaveRes.value.data.data;
          setStats(prev => ({
            ...prev,
            leaveBalance: lData.remaining || 0,
            totalLeaves: lData.total || 0,
            daysPresent: lData.daysPresent || 0,
            totalWorkingDays: lData.workingDays || 0
          }));
        }
      } catch {
        /* fail gracefully */
      }
    };

    fetchDashboard();
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const myStats = [
    { label: 'Days Present', value: stats.daysPresent, total: stats.totalWorkingDays || null, icon: AttendanceIcon, color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-600' },
    { label: 'Leave Balance', value: stats.leaveBalance, total: stats.totalLeaves || null, icon: LeaveIcon, color: 'from-blue-500 to-indigo-500', textColor: 'text-blue-600' },
    { label: 'Tasks Pending', value: tasks.filter(t => t.status === 'pending').length, total: null, icon: TaskIcon, color: 'from-amber-500 to-orange-500', textColor: 'text-amber-600' },
    { label: 'Pending Payslips', value: stats.pendingPayslips, total: null, icon: PayslipIcon, color: 'from-violet-500 to-purple-600', textColor: 'text-violet-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-6 space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-12 -translate-x-12" />
        <div className="relative">
          <p className="text-teal-200 text-sm font-medium mb-1">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.firstName || 'Staff'}! 🌟</h1>
          <p className="text-teal-100 text-sm mb-4">You're an essential part of what makes this school work.</p>
          
          <div className="flex gap-2 flex-wrap items-center">
            {checkedIn ? (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                Checked In Today
              </div>
            ) : (
              <button 
                onClick={() => setCheckedIn(true)}
                className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-5 py-2 rounded-full text-sm hover:bg-teal-50 transition-colors cursor-pointer border-0"
              >
                <CheckIcon fontSize="small" /> Mark Attendance
              </button>
            )}

            <button 
              onClick={() => setLeaveModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-full text-xs transition-colors cursor-pointer border-0 shadow-sm"
            >
              <LeaveIcon style={{ fontSize: 16 }} /> Apply Leave
            </button>
            <button 
              onClick={() => setQueryModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-full text-xs transition-colors cursor-pointer border-0 shadow-sm"
            >
              <HelpIcon style={{ fontSize: 16 }} /> Ask Principal
            </button>
            <Link 
              to="/career/referrals" 
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-full text-xs transition-colors no-underline shadow-sm"
            >
              <GiftIcon style={{ fontSize: 16 }} /> Referral Rewards Hub
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {myStats.map(({ label, value, total, icon: Icon, color, textColor }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="text-white" style={{ fontSize: 20 }} />
            </div>
            <p className={`text-2xl font-black ${textColor}`}>
              {value}{total ? <span className="text-base font-medium text-gray-400"> /{total}</span> : ''}
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
            {total && (
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${Math.min(100, (value / total) * 100)}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Shift */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalIcon className="text-teal-500" fontSize="small" /> Today's Shift
          </h2>
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-lg font-black text-teal-800">General Shift</p>
              <div className="flex items-center gap-2 mt-1">
                <ScheduleIcon className="text-teal-500" style={{ fontSize: 16 }} />
                <p className="text-sm text-teal-700 font-medium">08:30 AM – 04:30 PM</p>
              </div>
            </div>
            <div className="pt-3 border-t border-teal-100 space-y-2">
              <div className="flex items-start gap-2">
                <LocationIcon className="text-gray-400 mt-0.5" style={{ fontSize: 15 }} />
                <p className="text-sm text-gray-600">Main Campus – Administrative Wing</p>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="text-gray-400" style={{ fontSize: 15 }} />
                <p className="text-sm text-gray-600">Supervisor: Operations / HR Desk</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Link to="/leave/my-leave" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors no-underline group">
              <span className="text-sm text-gray-700 font-medium flex items-center gap-2"><LeaveIcon fontSize="small" className="text-indigo-400" /> Apply for Leave</span>
              <ArrowIcon className="text-gray-300 group-hover:text-indigo-500" fontSize="small" />
            </Link>
            <Link to="/hr/self-service" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors no-underline group">
              <span className="text-sm text-gray-700 font-medium flex items-center gap-2"><PayslipIcon fontSize="small" className="text-violet-400" /> View Payslip</span>
              <ArrowIcon className="text-gray-300 group-hover:text-indigo-500" fontSize="small" />
            </Link>
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TaskIcon className="text-amber-500" fontSize="small" /> My Tasks Today
            </h2>
            <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
              {tasks.filter(t => t.status === 'pending').length} pending
            </span>
          </div>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <TaskIcon style={{ fontSize: 28 }} className="text-gray-300 mb-1" />
                <p className="text-xs font-bold text-gray-600">No pending tasks</p>
                <p className="text-[11px] text-gray-400 mt-0.5">You have no tasks assigned for today.</p>
              </div>
            ) : (
              tasks.map((t, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${t.status === 'done' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-amber-200 hover:bg-amber-50'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${t.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                    {t.status === 'done' && <CheckIcon style={{ fontSize: 12 }} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.task}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[t.priority] || priorityColors.low}`}>{t.priority}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertIcon className="text-rose-500" fontSize="small" /> Announcements
          </h2>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <AlertIcon style={{ fontSize: 28 }} className="text-gray-300 mb-1" />
                <p className="text-xs font-bold text-gray-600">No active announcements</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Staff notices and memos will appear here when published.</p>
              </div>
            ) : (
              announcements.map((a, i) => (
                <div key={a._id || i} className="p-4 rounded-xl border-l-4 border-indigo-400 bg-indigo-50/60">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-400 ml-2 flex-shrink-0">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'}</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{a.content || a.message || 'Official circular notice'}</p>
                </div>
              ))
            )}
          </div>
          <Link to="/communication/announcements" className="mt-4 flex items-center justify-center gap-2 text-sm text-indigo-600 font-medium hover:underline no-underline">
            View All Announcements →
          </Link>
        </div>
      </div>

      {/* Quick Leave Request Modal */}
      <QuickLeaveRequestModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        defaultRole="STAFF"
        applicantName={`${user?.firstName || 'Staff'} ${user?.lastName || ''}`.trim()}
      />

      {/* Direct Principal Query Modal */}
      <PrincipalQueryModal
        open={queryModalOpen}
        onClose={() => setQueryModalOpen(false)}
        senderRole="STAFF"
        senderName={`${user?.firstName || 'Staff'} ${user?.lastName || ''}`.trim()}
      />
    </div>
  );
};

export default NonTeachingStaffDashboard;
