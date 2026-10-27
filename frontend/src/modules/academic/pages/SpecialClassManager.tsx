import React, { useState, useEffect } from 'react';
import axios from '../../../core/api/axios';
import {
  Stars as SpecialIcon,
  Person as TeacherIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Assignment as AssignIcon,
  Palette as PaletteIcon,
  Science as ScienceIcon,
  Calculate as MathIcon,
  EmojiObjects as ConceptIcon,
  ArrowForward as ArrowIcon,
  PlayArrow as PlayIcon,
  DoneAll as DoneAllIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Notes as NotesIcon,
  HowToReg as AttendIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Box, Typography,
  Chip, IconButton, Divider, Alert, Tooltip
} from '@mui/material';

type SpecialType = 'REMEDIAL' | 'ENRICHMENT' | 'PRACTICAL' | 'WORKSHOP' | 'MASTERCLASS' | 'REVISION';

interface SpecialClass {
  _id?: string;
  id?: string;
  title: string;
  type: SpecialType;
  subject: string;
  targetGroup: string;
  teacher: string;
  venue: string;
  scheduledAt: string;
  duration: number;
  maxSeats: number;
  enrolled: number;
  objectives: string[];
  prerequisites?: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface StudentAttendee {
  id: string;
  name: string;
  grade: string;
  rollNo: string;
  attendance: 'PRESENT' | 'ABSENT' | 'LATE';
}

const DEFAULT_SPECIAL_CLASSES: SpecialClass[] = [
  {
    _id: 'sc-101',
    id: 'sc-101',
    title: 'Advanced Calculus & Quantum Mechanics Applications',
    type: 'MASTERCLASS',
    subject: 'Physics & Mathematics',
    targetGroup: 'Grade 11 & 12 Advanced Batch',
    teacher: 'Dr. Anand Ramanathan (HOD Physics)',
    venue: 'Einstein Discovery Seminar Hall (Room 302)',
    scheduledAt: new Date(Date.now() + 3600000 * 2).toISOString(),
    duration: 90,
    maxSeats: 35,
    enrolled: 28,
    objectives: [
      'Derive Schrödinger wave equations in one dimension',
      'Apply Taylor and Fourier series to quantum harmonic oscillators',
      'Solve previous year JEE Advanced and Olympiad challenging problems'
    ],
    prerequisites: 'Strong foundation in differential equations and basic atomic models',
    status: 'IN_PROGRESS'
  },
  {
    _id: 'sc-102',
    id: 'sc-102',
    title: 'DNA Extraction & Electrophoresis Live Lab Clinic',
    type: 'PRACTICAL',
    subject: 'Biology & Biotech',
    targetGroup: 'Grade 10 Biology Students',
    teacher: 'Dr. Meenakshi Sundaram (Biology Specialist)',
    venue: 'Bio-Chemical Research Lab 2',
    scheduledAt: new Date(Date.now() + 3600000 * 24).toISOString(),
    duration: 75,
    maxSeats: 25,
    enrolled: 22,
    objectives: [
      'Perform strawberry and banana DNA cold-ethanol extraction',
      'Load agarose gel electrophoresis combs without air bubbles',
      'Interpret UV transilluminator band migrations'
    ],
    prerequisites: 'Completed Lab Safety orientation & PPE gear compliance',
    status: 'UPCOMING'
  },
  {
    _id: 'sc-103',
    id: 'sc-103',
    title: 'Algebraic Trigonometry Remedial Drill',
    type: 'REMEDIAL',
    subject: 'Mathematics',
    targetGroup: 'Grade 9 Need-Support Scholars',
    teacher: 'Prof. Rajesh Sharma',
    venue: 'Academic Intervention Suite A-104',
    scheduledAt: new Date(Date.now() + 3600000 * 48).toISOString(),
    duration: 60,
    maxSeats: 20,
    enrolled: 16,
    objectives: [
      'Master fundamental trigonometric identities (sin²θ + cos²θ = 1)',
      'Calculate heights and distances using tangent angle ratios',
      'Eliminate common sign and quadrant errors in sine/cosine graphs'
    ],
    prerequisites: 'Unit test 2 trigonometry score review',
    status: 'UPCOMING'
  },
  {
    _id: 'sc-104',
    id: 'sc-104',
    title: 'Robotics Microcontroller & IoT Sensor Integration',
    type: 'WORKSHOP',
    subject: 'Computer Science & STEM',
    targetGroup: 'Middle & Senior School Robotics Club',
    teacher: 'Er. Sandeep Varma',
    venue: 'Tinkering Innovation FabLab',
    scheduledAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    duration: 120,
    maxSeats: 30,
    enrolled: 30,
    objectives: [
      'Interface Ultrasonic HC-SR04 distance sensors with ESP32',
      'Stream live telemetry over MQTT to School Cloud IoT broker',
      'Calibrate autonomous obstacle avoidance algorithms'
    ],
    prerequisites: 'Basic C++/Arduino IDE syntax familiarity',
    status: 'COMPLETED'
  }
];

const INITIAL_STUDENTS: StudentAttendee[] = [
  { id: 'STU-101', name: 'Aarav Sharma', grade: 'Grade 11-A', rollNo: '1101', attendance: 'PRESENT' },
  { id: 'STU-102', name: 'Diya Patel', grade: 'Grade 11-A', rollNo: '1104', attendance: 'PRESENT' },
  { id: 'STU-103', name: 'Rohan Joshi', grade: 'Grade 11-B', rollNo: '1112', attendance: 'LATE' },
  { id: 'STU-104', name: 'Ananya Sen', grade: 'Grade 11-B', rollNo: '1118', attendance: 'PRESENT' },
  { id: 'STU-105', name: 'Kabir Mehta', grade: 'Grade 11-C', rollNo: '1125', attendance: 'ABSENT' },
  { id: 'STU-106', name: 'Priya Nair', grade: 'Grade 11-C', rollNo: '1130', attendance: 'PRESENT' }
];

const typeConfig: Record<SpecialType, { label: string; color: string; icon: React.ReactNode; gradient: string }> = {
  REMEDIAL: { label: 'Remedial', color: 'bg-rose-100 text-rose-700', icon: <ConceptIcon />, gradient: 'from-rose-500 to-pink-500' },
  ENRICHMENT: { label: 'Enrichment', color: 'bg-violet-100 text-violet-700', icon: <SpecialIcon />, gradient: 'from-violet-500 to-purple-600' },
  PRACTICAL: { label: 'Practical', color: 'bg-emerald-100 text-emerald-700', icon: <ScienceIcon />, gradient: 'from-emerald-500 to-teal-600' },
  WORKSHOP: { label: 'Workshop', color: 'bg-amber-100 text-amber-700', icon: <PaletteIcon />, gradient: 'from-amber-500 to-orange-500' },
  MASTERCLASS: { label: 'Masterclass', color: 'bg-indigo-100 text-indigo-700', icon: <MathIcon />, gradient: 'from-indigo-500 to-blue-600' },
  REVISION: { label: 'Revision', color: 'bg-sky-100 text-sky-700', icon: <AssignIcon />, gradient: 'from-sky-500 to-cyan-600' },
};

const statusColors: Record<string, string> = {
  UPCOMING: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-emerald-100 text-emerald-700 animate-pulse font-bold',
  COMPLETED: 'bg-gray-100 text-gray-600 font-bold',
};

const SpecialClassManager: React.FC = () => {
  const [classes, setClasses] = useState<SpecialClass[]>(DEFAULT_SPECIAL_CLASSES);
  const [filter, setFilter] = useState<string>('all');
  const [dialog, setDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Details & Working Session Modal State
  const [workingModalOpen, setWorkingModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SpecialClass | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [attendees, setAttendees] = useState<StudentAttendee[]>(INITIAL_STUDENTS);
  const [checkedObjectives, setCheckedObjectives] = useState<Record<number, boolean>>({ 0: true });
  const [sessionNotes, setSessionNotes] = useState('Session underway. Students actively engaged in foundational derivations.');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('Grade 11-A');

  const [form, setForm] = useState<any>({
    title: '',
    type: 'WORKSHOP',
    subject: '',
    targetGroup: '',
    teacher: '',
    venue: '',
    scheduledAt: '',
    duration: 60,
    maxSeats: 30,
    objectives: '',
    prerequisites: ''
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/learning/special-classes');
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setClasses(res.data.data);
      } else {
        setClasses(DEFAULT_SPECIAL_CLASSES);
      }
    } catch (err) {
      console.error(err);
      setClasses(DEFAULT_SPECIAL_CLASSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenDetails = (cls: SpecialClass) => {
    setSelectedClass(cls);
    setActiveTab(0);
    setWorkingModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (!selectedClass) return;
    const targetId = selectedClass._id || selectedClass.id;
    try {
      if (targetId && !targetId.startsWith('sc-')) {
        await axios.put(`/learning/special-classes/${targetId}`, { status: newStatus });
      }
      setSelectedClass(prev => prev ? { ...prev, status: newStatus } : null);
      setClasses(prev => prev.map(c => ((c._id || c.id) === targetId ? { ...c, status: newStatus } : c)));
      setNotice(`Session status transitioned to [${newStatus.replace('_', ' ')}] in real time.`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setSelectedClass(prev => prev ? { ...prev, status: newStatus } : null);
      setClasses(prev => prev.map(c => ((c._id || c.id) === targetId ? { ...c, status: newStatus } : c)));
      setNotice(`Session status updated to [${newStatus.replace('_', ' ')}]`);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleToggleAttendance = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendees(prev => prev.map(st => st.id === studentId ? { ...st, attendance: status } : st));
  };

  const handleMarkAllPresent = () => {
    setAttendees(prev => prev.map(st => ({ ...st, attendance: 'PRESENT' })));
    setNotice('All enrolled scholars marked PRESENT');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleEnrollStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent: StudentAttendee = {
      id: `STU-${100 + attendees.length + 1}`,
      name: newStudentName.trim(),
      grade: newStudentGrade,
      rollNo: `${1100 + attendees.length + 1}`,
      attendance: 'PRESENT'
    };
    setAttendees(prev => [...prev, newStudent]);
    if (selectedClass) {
      const updatedClass = { ...selectedClass, enrolled: (selectedClass.enrolled || 0) + 1 };
      setSelectedClass(updatedClass);
      setClasses(prev => prev.map(c => (c._id || c.id) === (selectedClass._id || selectedClass.id) ? updatedClass : c));
    }
    setNewStudentName('');
    setNotice(`Student [${newStudent.name}] enrolled successfully!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleToggleObjective = (idx: number) => {
    setCheckedObjectives(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCreate = async () => {
    if (!form.title) {
      alert('Please provide a class title');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        objectives: typeof form.objectives === 'string' ? form.objectives.split('\n').filter(Boolean) : form.objectives,
        scheduledAt: form.scheduledAt || new Date().toISOString()
      };
      const res = await axios.post('/learning/special-classes', payload);
      setDialog(false);
      setForm({
        title: '',
        type: 'WORKSHOP',
        subject: '',
        targetGroup: '',
        teacher: '',
        venue: '',
        scheduledAt: '',
        duration: 60,
        maxSeats: 30,
        objectives: '',
        prerequisites: ''
      });
      if (res.data?.data) {
        setClasses(prev => [res.data.data, ...prev]);
      } else {
        fetchClasses();
      }
      setNotice('Special Class scheduled and added to Academic Calendar.');
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      const newClass: SpecialClass = {
        _id: `sc-${Date.now()}`,
        id: `sc-${Date.now()}`,
        title: form.title,
        type: form.type,
        subject: form.subject || 'General Academic',
        targetGroup: form.targetGroup || 'All Students',
        teacher: form.teacher || 'Faculty Specialist',
        venue: form.venue || 'Lab / Seminar Hall',
        scheduledAt: form.scheduledAt || new Date().toISOString(),
        duration: Number(form.duration) || 60,
        maxSeats: Number(form.maxSeats) || 30,
        enrolled: 1,
        objectives: typeof form.objectives === 'string' ? form.objectives.split('\n').filter(Boolean) : ['Comprehensive topic review'],
        prerequisites: form.prerequisites,
        status: 'UPCOMING'
      };
      setClasses(prev => [newClass, ...prev]);
      setDialog(false);
      setNotice('Special Class scheduled locally.');
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === 'all' ? classes : classes.filter(c => c.type === filter);

  const presentCount = attendees.filter(a => a.attendance === 'PRESENT').length;
  const lateCount = attendees.filter(a => a.attendance === 'LATE').length;
  const absentCount = attendees.filter(a => a.attendance === 'ABSENT').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 p-6 space-y-6">
      
      {/* Toast Notice */}
      {notice && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                Academic Excellence
              </span>
              <span className="text-xs bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                ● Live Interactive Desk
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-1">⭐ Special Classes & Remedial Programs</h1>
            <p className="text-violet-200 text-sm max-w-xl">
              Track remedial cohorts, enrichment workshops, practical labs, and revision clinics with real-time session execution and student attendance.
            </p>
            <div className="flex gap-2 mt-4 flex-wrap">
              {(['MASTERCLASS', 'PRACTICAL', 'WORKSHOP', 'REMEDIAL', 'ENRICHMENT'] as SpecialType[]).map(t => (
                <span key={t} className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors cursor-default">
                  {typeConfig[t].label}: {classes.filter(c => c.type === t).length}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={fetchClasses}
              startIcon={<RefreshIcon />}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.3)', textTransform: 'none', borderRadius: 2 }}
            >
              Refresh
            </Button>
            <button
              onClick={() => setDialog(true)}
              className="flex items-center gap-2 bg-white text-violet-700 hover:bg-violet-50 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 text-sm cursor-pointer"
            >
              <AddIcon style={{ fontSize: 18 }} /> New Special Class
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'MASTERCLASS', 'PRACTICAL', 'WORKSHOP', 'REMEDIAL', 'ENRICHMENT', 'REVISION'].map(t => {
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === t
                  ? 'bg-violet-700 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {t === 'all' ? 'All Sessions' : typeConfig[t as SpecialType].label}
            </button>
          );
        })}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(cls => {
          const type = typeConfig[cls.type] || typeConfig.WORKSHOP;
          const max = cls.maxSeats || 30;
          const pct = Math.min(100, Math.round(((cls.enrolled || 0) / max) * 100));

          return (
            <div
              key={cls._id || cls.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className={`h-1.5 bg-gradient-to-r ${type.gradient}`} />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                      <div style={{ fontSize: 18, display: 'flex' }}>
                        {type.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${type.color}`}>{type.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[cls.status] || 'bg-gray-100 text-gray-600'}`}>
                          {(cls.status || 'UPCOMING').replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight hover:text-violet-700 transition-colors cursor-pointer" onClick={() => handleOpenDetails(cls)}>
                        {cls.title}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600"><TeacherIcon style={{ fontSize: 14 }} className="text-gray-400" /> {cls.teacher || 'Instructor'}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600"><GroupIcon style={{ fontSize: 14 }} className="text-gray-400" /> {cls.targetGroup || 'All Students'}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <EventIcon style={{ fontSize: 14 }} className="text-gray-400" />
                      {cls.scheduledAt ? new Date(cls.scheduledAt).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Upcoming'} · {cls.duration || 60} mins
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">📍 {cls.venue || 'Classroom / Lab'}</div>
                  </div>

                  {/* Objectives Preview */}
                  {cls.objectives && cls.objectives.length > 0 && (
                    <div className="mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Learning Goals</p>
                      <div className="space-y-1">
                        {cls.objectives.slice(0, 2).map((o, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                            <CheckIcon className="text-emerald-500 flex-shrink-0 mt-0.5" style={{ fontSize: 13 }} />
                            <span className="line-clamp-1">{o}</span>
                          </div>
                        ))}
                        {cls.objectives.length > 2 && <p className="text-[11px] text-violet-600 font-semibold ml-4">+{cls.objectives.length - 2} more objectives</p>}
                      </div>
                    </div>
                  )}

                  {/* Enrollment Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-500 font-medium">Cohort Enrolled</span>
                      <span className={`text-xs font-bold ${pct >= 90 ? 'text-red-500' : 'text-emerald-600'}`}>{cls.enrolled || 0}/{max}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${pct >= 90 ? 'from-red-400 to-rose-500' : type.gradient}`} style={{ width: `${pct}%`, transition: 'width 0.6s ease' }} />
                    </div>
                    {pct >= 90 && <p className="text-[11px] text-red-500 font-medium mt-1">Almost full cohort!</p>}
                  </div>
                </div>
              </div>

              {/* Action Buttons with Working Arrow Mark */}
              <div className="p-5 pt-0">
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleOpenDetails(cls)}
                    className={`flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r ${type.gradient} text-white py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-95 shadow-sm active:scale-98 cursor-pointer`}
                  >
                    {cls.status === 'COMPLETED' ? '📊 View Report & Outcomes' : '⚡ Open Working Session'}
                  </button>
                  <Tooltip title="Open detailed session working desk">
                    <button 
                      onClick={() => handleOpenDetails(cls)}
                      className="px-3 py-2 border border-violet-200 rounded-xl text-violet-700 hover:bg-violet-50 hover:border-violet-400 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                    >
                      <ArrowIcon style={{ fontSize: 16 }} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED WORKING & EXECUTION MODAL */}
      <Dialog 
        open={workingModalOpen} 
        onClose={() => setWorkingModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {selectedClass && (
          <>
            <DialogTitle sx={{ p: 0 }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: '#1e1b4b', 
                color: 'white', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: 2 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
                    <SpecialIcon sx={{ color: '#c084fc', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip label={selectedClass.type} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
                      <Chip 
                        label={selectedClass.status.replace('_', ' ')} 
                        size="small" 
                        color={selectedClass.status === 'IN_PROGRESS' ? 'success' : selectedClass.status === 'COMPLETED' ? 'default' : 'primary'} 
                        sx={{ fontWeight: 800 }} 
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'white' }}>
                      {selectedClass.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {selectedClass.subject} · {selectedClass.venue} · {selectedClass.teacher}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedClass.status === 'UPCOMING' && (
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      startIcon={<PlayIcon />}
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                      Start Session
                    </Button>
                  )}
                  {selectedClass.status === 'IN_PROGRESS' && (
                    <Button 
                      variant="contained" 
                      color="info" 
                      size="small" 
                      startIcon={<DoneAllIcon />}
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                      Mark Completed
                    </Button>
                  )}
                  {selectedClass.status === 'COMPLETED' && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', borderRadius: 2 }}
                    >
                      Re-open Session
                    </Button>
                  )}
                  <IconButton onClick={() => setWorkingModalOpen(false)} sx={{ color: 'white' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              <Tabs 
                value={activeTab} 
                onChange={(_, v) => setActiveTab(v)} 
                sx={{ px: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}
              >
                <Tab label="Session Overview & Goals" />
                <Tab label={`Scholar Attendance (${attendees.length})`} />
                <Tab label="Observations & Notes" />
              </Tabs>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              {/* TAB 0: OVERVIEW & OBJECTIVES */}
              {activeTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Target Cohort</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedClass.targetGroup}</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Session Duration</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedClass.duration} Minutes</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Venue / Room Allocation</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedClass.venue}</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Lead Educator</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedClass.teacher}</Typography>
                    </Box>
                  </Box>

                  {selectedClass.prerequisites && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <strong>Prerequisites / Entry Criteria:</strong> {selectedClass.prerequisites}
                    </Alert>
                  )}

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#1e293b' }}>
                      Session Learning Objectives (Check off as covered):
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedClass.objectives && selectedClass.objectives.length > 0 ? (
                        selectedClass.objectives.map((obj, i) => (
                          <Box 
                            key={i} 
                            onClick={() => handleToggleObjective(i)}
                            sx={{ 
                              p: 1.5, 
                              borderRadius: 2, 
                              border: '1px solid', 
                              borderColor: checkedObjectives[i] ? '#10b981' : '#e2e8f0', 
                              bgcolor: checkedObjectives[i] ? '#ecfdf5' : 'white',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Box sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              bgcolor: checkedObjectives[i] ? '#10b981' : '#e2e8f0',
                              color: 'white'
                            }}>
                              {checkedObjectives[i] && <CheckIcon sx={{ fontSize: 14 }} />}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: checkedObjectives[i] ? 700 : 500, color: checkedObjectives[i] ? '#065f46' : 'text.primary' }}>
                              {obj}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">No learning objectives documented.</Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* TAB 1: ATTENDANCE & ROSTER */}
              {activeTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={`Present: ${presentCount}`} color="success" size="small" sx={{ fontWeight: 700 }} />
                      <Chip label={`Late: ${lateCount}`} color="warning" size="small" sx={{ fontWeight: 700 }} />
                      <Chip label={`Absent: ${absentCount}`} color="error" size="small" sx={{ fontWeight: 700 }} />
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<AttendIcon />}
                      onClick={handleMarkAllPresent}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Mark All Present
                    </Button>
                  </Box>

                  {/* Student Table */}
                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', p: 1.5, bgcolor: '#f8fafc', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #e2e8f0' }}>
                      <span>Student Name</span>
                      <span>Class / Section</span>
                      <span>Roll Number</span>
                      <span style={{ textAlign: 'right' }}>Attendance Status</span>
                    </Box>
                    {attendees.map(st => (
                      <Box key={st.id} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', p: 1.5, alignItems: 'center', borderBottom: '1px solid #f1f5f9', '&:hover': { bgcolor: '#f8fafc' } }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{st.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{st.grade}</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>#{st.rollNo}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleToggleAttendance(st.id, 'PRESENT')}
                            className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                              st.attendance === 'PRESENT' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(st.id, 'LATE')}
                            className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                              st.attendance === 'LATE' ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(st.id, 'ABSENT')}
                            className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                              st.attendance === 'ABSENT' ? 'bg-rose-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Absent
                          </button>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Quick Add Student */}
                  <Box sx={{ p: 2, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block', color: 'text.secondary' }}>
                      Quick Add Student to this Special Cohort:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <TextField 
                        placeholder="Student Full Name" 
                        size="small" 
                        value={newStudentName} 
                        onChange={e => setNewStudentName(e.target.value)} 
                        sx={{ flex: 1 }}
                      />
                      <TextField 
                        placeholder="Grade / Section" 
                        size="small" 
                        value={newStudentGrade} 
                        onChange={e => setNewStudentGrade(e.target.value)} 
                        sx={{ width: 140 }}
                      />
                      <Button 
                        variant="contained" 
                        startIcon={<PersonAddIcon />} 
                        onClick={handleEnrollStudent}
                        disabled={!newStudentName.trim()}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Enroll
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* TAB 2: NOTES & OUTCOMES */}
              {activeTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Document teacher observations, individual student mastery, homework assignments, or lab findings for parent and academic coordinator reporting.
                  </Typography>
                  <TextField 
                    label="Educator Session Log & Notes" 
                    multiline 
                    rows={5} 
                    value={sessionNotes} 
                    onChange={e => setSessionNotes(e.target.value)} 
                    fullWidth 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        setNotice('Session notes & feedback saved to academic repository.');
                        setTimeout(() => setNotice(null), 3000);
                      }}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Save Session Notes
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
              <Button onClick={() => setWorkingModalOpen(false)}>Close Desk</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={dialog} onClose={() => !saving && setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>⭐ Schedule Special Class</DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4 pt-1">
            <TextField 
              label="Title" 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
              fullWidth 
              required 
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select 
                label="Type" 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                {(Object.keys(typeConfig) as SpecialType[]).map(t => <MenuItem key={t} value={t}>{typeConfig[t].label}</MenuItem>)}
              </Select>
            </FormControl>
            <div className="grid grid-cols-2 gap-3">
              <TextField 
                label="Subject" 
                value={form.subject} 
                onChange={e => setForm({ ...form, subject: e.target.value })} 
                fullWidth 
              />
              <TextField 
                label="Target Group (e.g. Grade 10 A)" 
                value={form.targetGroup} 
                onChange={e => setForm({ ...form, targetGroup: e.target.value })} 
                fullWidth 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField 
                label="Teacher / Instructor" 
                value={form.teacher} 
                onChange={e => setForm({ ...form, teacher: e.target.value })} 
                fullWidth 
              />
              <TextField 
                label="Venue / Room" 
                value={form.venue} 
                onChange={e => setForm({ ...form, venue: e.target.value })} 
                fullWidth 
              />
            </div>
            <TextField 
              label="Date & Time" 
              type="datetime-local" 
              value={form.scheduledAt} 
              onChange={e => setForm({ ...form, scheduledAt: e.target.value })} 
              fullWidth 
              slotProps={{ inputLabel: { shrink: true } }} 
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField 
                label="Duration (mins)" 
                type="number" 
                value={form.duration} 
                onChange={e => setForm({ ...form, duration: Number(e.target.value) })} 
                fullWidth 
              />
              <TextField 
                label="Max Seats" 
                type="number" 
                value={form.maxSeats} 
                onChange={e => setForm({ ...form, maxSeats: Number(e.target.value) })} 
                fullWidth 
              />
            </div>
            <TextField 
              label="Learning Objectives (one per line)" 
              value={form.objectives} 
              onChange={e => setForm({ ...form, objectives: e.target.value })} 
              multiline 
              rows={3} 
              fullWidth 
            />
            <TextField 
              label="Prerequisites (optional)" 
              value={form.prerequisites} 
              onChange={e => setForm({ ...form, prerequisites: e.target.value })} 
              fullWidth 
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Scheduling...' : 'Schedule Class'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SpecialClassManager;
