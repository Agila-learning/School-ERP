import React, { useEffect, useState } from 'react';
import {
  MenuBook as BookIcon,
  Assignment as HomeworkIcon,
  Groups as ClassIcon,
  EventNote as TimetableIcon,
  Assessment as GradeIcon,
  Notifications as NotifIcon,
  Person as StudentIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  ArrowForward as ArrowIcon,
  BeachAccess as LeaveIcon,
  AttachMoney as SalaryIcon,
  Event as EventIcon,
  VideoCall as MeetingIcon,
  ExitToApp as ResignIcon,
  HowToReg as AttendanceIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  Science as ScienceIcon,
  Campaign as CampaignIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../../core/api/axios';
import { CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Typography, Paper } from '@mui/material';
import { getAcademicEvents } from '../../academic/api/academic.api';
import { getStoredCirculars, type OfficeCircular } from '../../operations/pages/OfficeCircularsDesk';
import { QuickLeaveRequestModal } from '../../../shared/components/QuickLeaveRequestModal';
import { PrincipalQueryModal } from '../../../shared/components/PrincipalQueryModal';
import { getAdvancedVisitors, approveVisit, smartRegisterVisitor } from '../../security/api/security.api';
import BadgeIcon from '@mui/icons-material/Badge';

const quickLinks = [
  { label: 'Mark Attendance', path: '/attendance/teacher', icon: AttendanceIcon, color: 'from-emerald-500 to-teal-600' },
  { label: 'Enter Marks', path: '/examination/marks-entry', icon: GradeIcon, color: 'from-violet-500 to-purple-600' },
  { label: 'Lab Attendance & Fines', path: '/lab/attendance', icon: ScienceIcon, color: 'from-teal-600 to-cyan-700' },
  { label: 'Post Observations', path: '/lab/observations', icon: DescriptionIcon, color: 'from-blue-600 to-indigo-700' },
  { label: 'Public Board Exams', path: '/examination/public-exams', icon: BookIcon, color: 'from-amber-600 to-rose-600' },
  { label: 'Learning Management', path: '/lms/teacher/dashboard', icon: HomeworkIcon, color: 'from-amber-500 to-orange-500' },
  { label: 'Timetable', path: '/timetable/teacher', icon: TimetableIcon, color: 'from-blue-500 to-indigo-600' },
  { label: 'Announcements', path: '/communication/announcements', icon: NotifIcon, color: 'from-rose-500 to-pink-600' },
  { label: 'My Students', path: '/admin/students', icon: StudentIcon, color: 'from-cyan-500 to-blue-500' },
  { label: 'My Leaves', path: '/leave/my-leave', icon: LeaveIcon, color: 'from-green-500 to-emerald-600' },
  { label: 'My Documents', path: '/hr/self-service/documents', icon: SalaryIcon, color: 'from-yellow-500 to-amber-600' },
  { label: 'Special Classes', path: '/academic/special-classes', icon: StarIcon, color: 'from-fuchsia-500 to-purple-600' },
  { label: 'Teacher Settings', path: '/teacher/settings', icon: SettingsIcon, color: 'from-gray-500 to-slate-600' },
];

const eventTypeBadge: Record<string, string> = {
  HOLIDAY: 'bg-red-100 text-red-700',
  EXAM: 'bg-violet-100 text-violet-700',
  EVENT: 'bg-blue-100 text-blue-700',
  CULTURAL: 'bg-orange-100 text-orange-700',
  SPORTS: 'bg-green-100 text-green-700',
};

const TeacherDashboard: React.FC = () => {
  const [dashData, setDashData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [circulars, setCirculars] = useState<OfficeCircular[]>([]);
  const [activeCircular, setActiveCircular] = useState<OfficeCircular | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [queryModalOpen, setQueryModalOpen] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const loadCirculars = () => {
    const all = getStoredCirculars();
    const staffCirculars = all.filter(c => c.status === 'PUBLISHED' && (c.targetAudience === 'STAFF' || c.targetAudience === 'ALL'));
    setCirculars(staffCirculars);
  };

  useEffect(() => {
    loadCirculars();
    window.addEventListener('circulars_updated', loadCirculars);
    return () => window.removeEventListener('circulars_updated', loadCirculars);
  }, []);

  const [expectedVisitors, setExpectedVisitors] = useState<any[]>([]);
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    fullName: '',
    phone: '',
    visitorCategory: 'PARENT',
    purpose: '',
    expectedArrival: new Date().toISOString().slice(0, 16)
  });

  const loadExpectedVisitors = () => {
    getAdvancedVisitors({ limit: 6 })
      .then(res => setExpectedVisitors(res.records || []))
      .catch(() => {
        setExpectedVisitors([]);
      });
  };

  useEffect(() => {
    loadExpectedVisitors();
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/staff-portal/dashboard').then(res => res.data?.data).catch(() => null),
      getAcademicEvents().catch(() => [])
    ]).then(([dash, evts]) => {
      setDashData(dash);
      const upcoming = evts
        .filter((e: any) => new Date(e.startDate) >= new Date())
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5);
      setEvents(upcoming);
    }).finally(() => setLoading(false));
  }, []);

  const staff = dashData?.staff;
  const assignments: any[] = dashData?.assignments || [];
  const stats = dashData?.stats || {};

  const statCards = [
    { label: 'My Classes', value: String(assignments.length || 0), icon: ClassIcon, gradient: 'from-blue-500 to-indigo-600', link: '/timetable/teacher' },
    { label: 'Leave Balance', value: `${stats.leaveBalance ?? '-'}d`, icon: LeaveIcon, gradient: 'from-emerald-500 to-teal-600', link: '/leave/my-leave' },
    { label: 'Learning Material', value: String(stats.pendingTasks || 0), icon: HomeworkIcon, gradient: 'from-amber-500 to-orange-500', link: '/lms/teacher/dashboard' },
    { label: 'Exam Entries', value: String(stats.upcomingClasses || assignments.length || 0), icon: GradeIcon, gradient: 'from-violet-500 to-purple-600', link: '/examination/marks-entry' },
  ];

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent)]" />
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
        <div className="relative flex flex-col md:flex-row justify-between gap-4 items-start">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-3xl font-bold mb-2">
              {greeting}, {staff?.preferredName || staff?.firstName || 'Teacher'}!
            </h1>
            <p className="text-blue-100 text-sm">
              {assignments.length > 0
                ? `You have ${assignments.length} active class assignment(s) today.`
                : 'Welcome to your Teacher Portal.'}
            </p>
            <div className="flex gap-2 mt-4 flex-wrap">
              <button 
                onClick={() => setLeaveModalOpen(true)} 
                className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 rounded-full text-white transition-colors cursor-pointer border-0 shadow-sm"
              >
                + Apply Leave
              </button>
              <button 
                onClick={() => setQueryModalOpen(true)} 
                className="text-xs font-bold bg-purple-500 hover:bg-purple-600 px-3.5 py-1.5 rounded-full text-white transition-colors cursor-pointer border-0 shadow-sm"
              >
                Ask Principal
              </button>
              <Link to="/timetable/exchange" className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full no-underline text-white transition-colors">
                Period Exchange Desk
              </Link>
              <Link to="/career/referrals" className="text-xs font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 px-3.5 py-1.5 rounded-full no-underline font-bold transition-colors shadow-sm">
                Referral Rewards Hub
              </Link>
              <Link to="/lab/schedule" className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full no-underline text-white transition-colors">
                Lab Practicals
              </Link>
              <Link to="/hr/self-service/documents" className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full no-underline text-white transition-colors">
                My Documents
              </Link>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {[
              { label: String(assignments.length), sublabel: 'Active Classes' },
              { label: staff?.designationId?.name || 'Teacher', sublabel: 'Role' },
              { label: staff?.employeeIdNumber || 'N/A', sublabel: 'Employee ID' }
            ].map(s => (
              <div key={s.sublabel} className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-base font-black truncate max-w-[90px]">{s.label}</p>
                <p className="text-xs text-blue-200 mt-1 whitespace-nowrap">{s.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Office Circulars Section */}
      {circulars.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CampaignIcon className="text-amber-400" />
              <h2 className="text-base font-bold tracking-wide">Official Office Circulars & Directives ({circulars.length})</h2>
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full text-indigo-100">Live Notices</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {circulars.slice(0, 3).map(c => (
              <div 
                key={c.id} 
                onClick={() => setActiveCircular(c)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-3.5 border border-white/10 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded">
                    {c.circularNo}
                  </span>
                  <span className="text-[10px] text-indigo-200">{c.publishDate}</span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1 line-clamp-1">{c.title}</h3>
                <p className="text-[11px] text-indigo-200 line-clamp-2 leading-relaxed">{c.summary}</p>
                <p className="text-[10px] text-amber-300 font-semibold mt-2">Read Notice →</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── EXPECTED VISITORS & APPOINTMENTS (STAFF PORTAL) ────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <BadgeIcon />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Expected Visitors & Appointments</h2>
              <p className="text-xs text-gray-500">Upcoming parents, guests, and official visitors scheduled for you</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setVisitorModalOpen(true)}
              className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              + Invite / Pre-register Visitor
            </button>
            <Link
              to="/office/appointments"
              className="no-underline text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-all"
            >
              View Full Schedule →
            </Link>
          </div>
        </div>

        {expectedVisitors.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <p className="text-xs text-gray-500 font-medium">No pending or expected visitors scheduled for today.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expectedVisitors.map(v => (
              <div key={v.id || v._id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-purple-50/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {v.visitorCategory}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      v.approvalStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {v.approvalStatus}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{v.visitorName}</h4>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{v.purpose}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Scheduled: {new Date(v.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {v.approvalStatus === 'PENDING' && (
                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200">
                    <button
                      onClick={async () => {
                        await approveVisit(v.id || v._id, 'APPROVE');
                        loadExpectedVisitors();
                      }}
                      className="flex-1 text-[11px] font-bold py-1 px-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        await approveVisit(v.id || v._id, 'REJECT', 'Host unavailable');
                        loadExpectedVisitors();
                      }}
                      className="flex-1 text-[11px] font-bold py-1 px-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRE-REGISTER VISITOR MODAL FOR STAFF */}
      <Dialog
        open={visitorModalOpen}
        onClose={() => setVisitorModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#7c3aed' }}>
          Schedule Expected Visitor
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <label className="text-xs font-bold text-gray-700 block mb-1">Visitor Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patel (Parent)"
                value={newVisitor.fullName}
                onChange={e => setNewVisitor({ ...newVisitor, fullName: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-purple-600"
              />
            </Box>
            <Box>
              <label className="text-xs font-bold text-gray-700 block mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                placeholder="+91 9876543210"
                value={newVisitor.phone}
                onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-purple-600"
              />
            </Box>
            <Box>
              <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
              <select
                value={newVisitor.visitorCategory}
                onChange={e => setNewVisitor({ ...newVisitor, visitorCategory: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-purple-600"
              >
                <option value="PARENT">Parent / Guardian</option>
                <option value="GUEST">Guest Speaker</option>
                <option value="VENDOR">Vendor / Publisher</option>
                <option value="OTHER">Other Visitor</option>
              </select>
            </Box>
            <Box>
              <label className="text-xs font-bold text-gray-700 block mb-1">Purpose of Visit *</label>
              <input
                type="text"
                required
                placeholder="e.g. PTM Discussion, Syllabus Guidance"
                value={newVisitor.purpose}
                onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-purple-600"
              />
            </Box>
            <Box>
              <label className="text-xs font-bold text-gray-700 block mb-1">Expected Arrival Time</label>
              <input
                type="datetime-local"
                value={newVisitor.expectedArrival}
                onChange={e => setNewVisitor({ ...newVisitor, expectedArrival: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-purple-600"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setVisitorModalOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none', fontWeight: 700 }}
            onClick={async () => {
              if (!newVisitor.fullName || !newVisitor.phone || !newVisitor.purpose) return;
              try {
                await smartRegisterVisitor({
                  ...newVisitor,
                  hostName: `${staff?.firstName || 'Faculty'} ${staff?.lastName || 'Member'}`.trim(),
                  hostDepartment: 'Academics',
                  registrationSource: 'PRE_REGISTERED',
                  approvalStatus: 'APPROVED'
                });
                setVisitorModalOpen(false);
                setNewVisitor({ fullName: '', phone: '', visitorCategory: 'PARENT', purpose: '', expectedArrival: new Date().toISOString().slice(0, 16) });
                loadExpectedVisitors();
              } catch (err: any) {
                alert(err.message || 'Failed to pre-register visitor');
              }
            }}
          >
            Confirm & Pre-Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dual Role: Subject Teacher & Laboratory Practicals Alert */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <ScienceIcon />
          </div>
          <div>
            <h3 className="text-sm font-bold text-teal-900">Dual Role: Subject Teacher & Laboratory Incharge</h3>
            <p className="text-xs text-teal-700 mt-0.5">
              Take practical attendance by importing student rosters directly, log apparatus breakage penalties, and post observation manuals (.docx / .pdf).
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
          <Link to="/lab/attendance" className="no-underline text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 px-3 py-2 rounded-xl transition-colors text-center flex-1 md:flex-none">
            Lab Attendance & Penalties
          </Link>
          <Link to="/lab/observations" className="no-underline text-xs font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 px-3 py-2 rounded-xl transition-colors text-center flex-1 md:flex-none">
            Post Observations
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, gradient, link }) => (
          <Link to={link} key={label} className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all no-underline flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
              <Icon className="text-white" style={{ fontSize: 22 }} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
            </div>
            <ArrowIcon className="ml-auto text-gray-200 group-hover:text-indigo-400 transition-colors flex-shrink-0" fontSize="small" />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {quickLinks.map(({ label, path, icon: Icon, color }) => (
            <Link to={path} key={label} className="no-underline">
              <div className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-white bg-gradient-to-br ${color} hover:opacity-90 hover:scale-105 transition-all cursor-pointer`}>
                <Icon style={{ fontSize: 22 }} />
                <span className="text-[10px] font-semibold text-center leading-tight">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Assigned Classes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ScheduleIcon className="text-blue-500" fontSize="small" /> My Class Assignments
            </h2>
            <Link to="/timetable/teacher" className="text-xs text-indigo-600 font-medium hover:underline">Full Timetable →</Link>
          </div>
          <div className="space-y-2">
            {assignments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No active class assignments found.</p>
            )}
            {assignments.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-gray-50 transition-all">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-violet-500' : 'bg-emerald-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate">{a.subjectId?.name || 'Subject'}</p>
                    {a.isClassCoordinator && <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">Coordinator</span>}
                  </div>
                  <p className="text-xs text-gray-500">{a.classId?.name || 'Class'} · {a.sectionId?.name || 'Section'}</p>
                </div>
                <div className="flex gap-2">
                  <Link to="/attendance/teacher" className="text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 px-2 py-1 rounded-lg no-underline transition-colors">
                    Attendance
                  </Link>
                  <Link to="/lms/teacher/dashboard" className="text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg no-underline transition-colors">
                    LMS Materials
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pending Actions */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Pending Actions</h3>
            <div className="space-y-1">
              {[
                { label: 'Grade submitted exam papers', link: '/examination/marks-entry' },
                { label: 'Post LMS materials for assigned classes', link: '/lms/teacher/dashboard' },
                { label: 'Review attendance corrections', link: '/attendance/corrections' },
                { label: 'Apply for pending leave', link: '/leave/my-leave' },
                { label: 'Confirm parent meeting requests', link: '/staff-portal/meetings' },
              ].map((a, i) => (
                <Link to={a.link} key={i} className="flex items-center justify-between py-2 px-3 rounded-xl text-sm text-indigo-700 font-medium hover:bg-indigo-50 no-underline border border-transparent hover:border-indigo-100 transition-all group">
                  <span>{a.label}</span>
                  <ArrowIcon className="text-gray-300 group-hover:text-indigo-500" fontSize="small" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Cultural Events & Holidays */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <EventIcon className="text-amber-500" fontSize="small" /> Upcoming Events
            </h2>
            <Link to="/admin/academics/events" className="text-xs text-indigo-600 font-medium hover:underline">All Events →</Link>
          </div>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No upcoming events.</p>
            ) : events.map((evt: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                <div className="flex-shrink-0 w-10 text-center">
                  <p className="text-lg font-black text-gray-900 leading-none">{new Date(evt.startDate).getDate()}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">
                    {new Date(evt.startDate).toLocaleString('en-IN', { month: 'short' })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{evt.name || evt.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${eventTypeBadge[evt.type] || 'bg-gray-100 text-gray-600'}`}>
                    {evt.type || 'EVENT'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Staff Contacts */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Quick Links</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Announcements', link: '/communication/announcements' },
                { label: 'Student Directory', link: '/admin/students' },
                { label: 'Schedule Meeting', link: '/staff-portal/meetings' },
                { label: 'My Profile & HR', link: '/teacher/settings' },
              ].map((l, i) => (
                <Link to={l.link} key={i} className="text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg no-underline font-medium transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* READ CIRCULAR MODAL */}
      <Dialog
        open={Boolean(activeCircular)}
        onClose={() => setActiveCircular(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {activeCircular && (
          <>
            <DialogTitle sx={{ fontWeight: 800, bgcolor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Official Circular • {activeCircular.circularNo}</span>
              <Button size="small" onClick={() => setActiveCircular(null)} sx={{ color: '#ffffff' }}>Close</Button>
            </DialogTitle>
            <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
              <Box sx={{ borderBottom: '2px solid #0f172a', pb: 2, mb: 2.5, textAlign: 'center' }}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: '#4f46e5' }}>
                  FOUNDATION INTERNATIONAL CENTRAL SCHOOL
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {activeCircular.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Date: {activeCircular.publishDate} • Category: {activeCircular.category} • Issued By: {activeCircular.issuedBy}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.8, mb: 3 }}>
                {activeCircular.content}
              </Typography>

              {activeCircular.attachmentName && (
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    📎 Attached Reference: {activeCircular.attachmentName} ({activeCircular.attachmentSize})
                  </Typography>
                </Paper>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Button onClick={() => window.print()} variant="outlined" sx={{ textTransform: 'none', fontWeight: 700 }}>
                Print Circular
              </Button>
              <Button onClick={() => setActiveCircular(null)} variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 700 }}>
                Acknowledge & Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Quick Leave Request Modal */}
      <QuickLeaveRequestModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        defaultRole="TEACHER"
        applicantName={`${staff?.firstName || 'Teacher'} ${staff?.lastName || ''}`.trim()}
      />

      {/* Direct Principal Query Modal */}
      <PrincipalQueryModal
        open={queryModalOpen}
        onClose={() => setQueryModalOpen(false)}
        senderRole="TEACHER"
        senderName={`${staff?.firstName || 'Teacher'} ${staff?.lastName || ''}`.trim()}
      />
    </div>
  );
};

export default TeacherDashboard;
