import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, Button, 
  CircularProgress, Avatar, LinearProgress, Divider, Chip, 
  Tabs, Tab, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Alert, Tooltip, Badge, MenuItem,
  Select, FormControl, InputLabel
} from '@mui/material';
import { QuickLeaveRequestModal } from '../../../shared/components/QuickLeaveRequestModal';
import { PrincipalQueryModal } from '../../../shared/components/PrincipalQueryModal';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CampaignIcon from '@mui/icons-material/Campaign';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ForumIcon from '@mui/icons-material/Forum';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ScienceIcon from '@mui/icons-material/Science';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import StarIcon from '@mui/icons-material/Star';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import HotelIcon from '@mui/icons-material/Hotel';
import HostelStudentSection from '../components/HostelStudentSection';
import api from '../../../core/api/axios';
import { getStoredCirculars, type OfficeCircular } from '../../operations/pages/OfficeCircularsDesk';
import { getStoredObservations, type PracticalObservation } from '../../lab/components/LabObservationsDesk';
import DocumentPreviewModal, { type DocumentPreviewData } from '../../documents/components/DocumentPreviewModal';

const MENTOR_CONTACTS = [
  { id: 'm1', name: 'Mrs. Radhika Iyer', subject: 'Mathematics & Algebra', role: 'Class Teacher & Senior Math', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', status: 'Online' },
  { id: 'm2', name: 'Dr. Arvind Swaminathan', subject: 'Physics & Laboratory', role: 'Physics Mentor', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80', status: 'Online' },
  { id: 'm3', name: 'Dr. Meenakshi Sundaram', subject: 'Chemistry & Practical', role: 'Chemistry Specialist', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80', status: 'Available' },
  { id: 'm4', name: 'Ms. Priya Raghavan', subject: 'Computer Science & AI', role: 'Computer Lab Lead', avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900ce?w=120&auto=format&fit=crop&q=80', status: 'Available' },
  { id: 'm5', name: 'Mr. David Fernandez', subject: 'English Literature', role: 'Senior English Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', status: 'Available' },
  { id: 'm6', name: 'Coach Rajesh Varma', subject: 'Physical Education', role: 'Head of Sports & Athletics', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', status: 'Available' },
];

const StudentPortalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Modals & Interactive Form States
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ subject: '', description: '', category: 'ACADEMIC', priority: 'MEDIUM' });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const [hwModalOpen, setHwModalOpen] = useState(false);
  const [selectedHw, setSelectedHw] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submittingHw, setSubmittingHw] = useState(false);

  const [selectedTeacherChat, setSelectedTeacherChat] = useState<string>('Mrs. Radhika Iyer');
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Office Circulars & Lab Observations
  const [circulars, setCirculars] = useState<OfficeCircular[]>([]);
  const [activeCircular, setActiveCircular] = useState<OfficeCircular | null>(null);
  const [observations, setObservations] = useState<PracticalObservation[]>([]);
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewData | null>(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [queryModalOpen, setQueryModalOpen] = useState(false);

  const loadStudentNotices = () => {
    const allCircs = getStoredCirculars();
    setCirculars(allCircs.filter(c => c.status === 'PUBLISHED' && (c.targetAudience === 'STUDENTS' || c.targetAudience === 'ALL')));
    setObservations(getStoredObservations());
  };

  useEffect(() => {
    loadStudentNotices();
    window.addEventListener('circulars_updated', loadStudentNotices);
    window.addEventListener('observations_updated', loadStudentNotices);
    return () => {
      window.removeEventListener('circulars_updated', loadStudentNotices);
      window.removeEventListener('observations_updated', loadStudentNotices);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/student-portal/dashboard');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load student dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load your student dashboard. Please ensure backend services are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Real-time live polling (every 4 seconds) to stream messages, attendance updates & complaints
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/student-portal/dashboard');
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        // Silent fail on background poll
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat on message updates
  useEffect(() => {
    if (activeTab === 5) {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.messages?.length, activeTab]);

  const handleRaiseComplaint = async () => {
    if (!complaintForm.subject || !complaintForm.description) return;
    try {
      setSubmittingComplaint(true);
      const res = await api.post('/student-portal/complaints', complaintForm);
      if (res.data?.success) {
        setComplaintModalOpen(false);
        setComplaintForm({ subject: '', description: '', category: 'ACADEMIC', priority: 'MEDIUM' });
        setActionSuccess('Grievance registered successfully! Ticket #' + (res.data.data?.id || 'New'));
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const optimisticText = chatInput;
    setChatInput('');
    
    // Instant optimistic update
    const optimisticMsg = {
      id: `MSG-OPT-${Date.now()}`,
      senderName: student?.firstName ? `${student.firstName} ${student.lastName || ''}` : 'Advik A (Student)',
      senderRole: 'Student',
      avatar: student?.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      text: optimisticText,
      timestamp: 'Just now',
      isTeacher: false,
      teacherName: selectedTeacherChat
    };

    setData((prev: any) => ({
      ...prev,
      messages: [...(prev?.messages || []), optimisticMsg]
    }));

    try {
      setSendingMsg(true);
      const res = await api.post('/student-portal/messages', { text: optimisticText, teacherName: selectedTeacherChat });
      if (res.data?.success) {
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSubmitHomework = async () => {
    if (!selectedHw) return;
    try {
      setSubmittingHw(true);
      const res = await api.post(`/student-portal/homework/${selectedHw.id}/submit`, { submissionText });
      if (res.data?.success) {
        setHwModalOpen(false);
        setSelectedHw(null);
        setSubmissionText('');
        setActionSuccess(`Homework "${selectedHw.title}" submitted successfully!`);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit homework');
    } finally {
      setSubmittingHw(false);
    }
  };

  const handleToggleEventRSVP = async (eventId: string) => {
    try {
      const res = await api.post(`/student-portal/events/${eventId}/register`);
      if (res.data?.success) {
        fetchDashboardData();
        setActionSuccess(res.data.message);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register for event');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 2 }}>
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body1" color="text.secondary">Loading Student 360 Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', textAlign: 'center', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error || 'Unable to load student data'}</Alert>
        <Button variant="contained" onClick={fetchDashboardData} startIcon={<RefreshIcon />}>
          Retry Connection
        </Button>
      </Box>
    );
  }

  const { student, parent, assignedStaff, homeworks, results, announcements, complaints, messages, sports, events, labs, curricular } = data;

  const pendingHomeworkCount = homeworks?.filter((h: any) => h.status === 'PENDING').length || 0;
  const openComplaintsCount = complaints?.filter((c: any) => c.status !== 'RESOLVED').length || 0;

  // Class & Grade Adaptation
  const classNameStr = (student?.class || '').toUpperCase();
  const isKindergarten = /^(KG|LKG|UKG|NURSERY|PRE-KG|KINDERGARTEN|PLAYGROUP)/i.test(classNameStr) || (student?.category === 'KINDERGARTEN');
  const isHigherSecondary = /^(GRADE 1[0-2]|CLASS 1[0-2]|10|11|12|SENIOR)/i.test(classNameStr);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, maxWidth: 1400, mx: 'auto', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Toast Alert */}
      {actionSuccess && (
        <Alert severity="success" onClose={() => setActionSuccess(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {actionSuccess}
        </Alert>
      )}

      {/* ================= HEADER HERO DOSSIER CARD (RESPONSIVE MULTI-DEVICE FIT) ================= */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 }, 
          mb: 3.5, 
          borderRadius: 4, 
          border: '1px solid #e2e8f0', 
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100%'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          alignItems: { xs: 'stretch', lg: 'center' }, 
          justifyContent: 'space-between', 
          gap: { xs: 2.5, lg: 3 }
        }}>
          {/* Left: Avatar + Details */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1.75, sm: 2.5 }, 
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            flex: 1,
            minWidth: 0
          }}>
            <Avatar 
              src={student.photoUrl} 
              sx={{ 
                width: { xs: 68, sm: 84, md: 92 }, 
                height: { xs: 68, sm: 84, md: 92 }, 
                border: '3px solid white', 
                boxShadow: '0 6px 18px rgba(16,185,129,0.25)', 
                bgcolor: '#10b981', 
                fontSize: { xs: '1.6rem', sm: '2rem' }, 
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.35rem', sm: '1.75rem', md: '1.95rem' }, wordBreak: 'break-word' }}>
                  {student.firstName} {student.lastName}
                </Typography>
                <Chip label="Active Scholar" color="success" size="small" sx={{ fontWeight: 700, height: 24, fontSize: '0.75rem' }} />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'center', 
                gap: { xs: 0.5, sm: 1 }, 
                mt: 0.5, 
                color: 'text.secondary',
                fontSize: { xs: '0.82rem', sm: '0.9rem' }
              }}>
                <span><strong>Roll:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{student.studentId}</span></span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span><strong>Class:</strong> {student.class}-{student.section}</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span><strong>Batch:</strong> {student.academicYear}</span>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap', maxWidth: '100%' }}>
                <Chip icon={<FamilyRestroomIcon />} label={`Parent: ${parent.firstName} (${parent.relationship})`} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.75rem' }} />
                <Chip icon={<SchoolIcon />} label={`Teacher: ${assignedStaff.classTeacher.name.split(',')[0]}`} size="small" variant="outlined" color="secondary" sx={{ fontSize: '0.75rem' }} />
                <Chip 
                  icon={<HotelIcon />} 
                  label="Hostel Resident (Room 204 • Kaveri Block)" 
                  size="small" 
                  color="primary" 
                  onClick={() => setActiveTab(12)} 
                  sx={{ fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', bgcolor: '#e0e7ff', color: '#3730a3' }} 
                />
                <Chip icon={<StarIcon />} label={student.rank} size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: '0.75rem' }} />
              </Box>
            </Box>
          </Box>

          {/* Right: Quick Metrics Pillar (Protected Against Clipping Across Devices) */}
          <Box sx={{ 
            p: { xs: 2, sm: 2.2 }, 
            bgcolor: '#ffffff', 
            borderRadius: 3, 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            width: { xs: '100%', lg: 370 },
            flexShrink: 0,
            boxSizing: 'border-box'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Overall Attendance Rate</Typography>
              <Typography variant="caption" fontWeight={800} sx={{ whiteSpace: 'nowrap' }} color={student.attendance.percentage >= 80 ? "success.main" : "warning.main"}>
                {student.attendance.percentage}% ({student.attendance.presentDays}/{student.attendance.totalDays} Days)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={student.attendance.percentage} 
              color={student.attendance.percentage >= 80 ? "success" : "warning"} 
              sx={{ height: 8, borderRadius: 4, mb: 2 }} 
            />
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, 
              gap: 1.5, 
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Button 
                size="small" 
                variant="contained" 
                startIcon={<CalendarMonthIcon />} 
                onClick={() => setLeaveModalOpen(true)}
                sx={{ 
                  borderRadius: 2, 
                  fontSize: { xs: '0.78rem', sm: '0.82rem' }, 
                  fontWeight: 700,
                  py: 0.9,
                  px: 1.5,
                  textTransform: 'none', 
                  bgcolor: '#4338ca', 
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(67,56,202,0.25)',
                  '&:hover': { bgcolor: '#3730a3' }, 
                  whiteSpace: 'nowrap',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                Apply Leave
              </Button>
              <Button 
                size="small" 
                variant="contained" 
                startIcon={<SendIcon />} 
                onClick={() => setQueryModalOpen(true)}
                sx={{ 
                  borderRadius: 2, 
                  fontSize: { xs: '0.78rem', sm: '0.82rem' }, 
                  fontWeight: 700,
                  py: 0.9,
                  px: 1.5,
                  textTransform: 'none', 
                  bgcolor: '#0f766e', 
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(15,118,110,0.25)',
                  '&:hover': { bgcolor: '#115e59' }, 
                  whiteSpace: 'nowrap',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                Ask Principal
              </Button>
              <Button 
                size="small" 
                variant="contained" 
                startIcon={<AddCircleIcon />} 
                onClick={() => setComplaintModalOpen(true)}
                sx={{ 
                  borderRadius: 2, 
                  fontSize: { xs: '0.78rem', sm: '0.82rem' }, 
                  fontWeight: 700,
                  py: 0.9,
                  px: 1.5,
                  textTransform: 'none', 
                  bgcolor: '#0f172a', 
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
                  '&:hover': { bgcolor: '#1e293b' }, 
                  whiteSpace: 'nowrap',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                Complaint
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={fetchDashboardData}
                sx={{ 
                  borderRadius: 2, 
                  fontSize: { xs: '0.78rem', sm: '0.82rem' }, 
                  fontWeight: 700,
                  py: 0.9,
                  px: 1.5, 
                  textTransform: 'none',
                  borderColor: '#cbd5e1',
                  bgcolor: '#f8fafc',
                  color: '#334155',
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
                  whiteSpace: 'nowrap',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ================= COMPREHENSIVE TAB SELECTOR ================= */}
      <Card sx={{ mb: 3.5, borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            '& .MuiTab-root': {
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.88rem',
              py: 2,
              minHeight: 64
            }
          }}
        >
          <Tab icon={<DashboardIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Overview Hub" />
          <Tab 
            icon={
              <Badge badgeContent={pendingHomeworkCount} color="error">
                <AssignmentIcon sx={{ fontSize: 20 }} />
              </Badge>
            } 
            iconPosition="start" 
            label="1. Homeworks" 
          />
          <Tab icon={<AssessmentIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="2. Results & Marks" />
          <Tab icon={<CampaignIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="3. Announcements" />
          <Tab 
            icon={
              <Badge badgeContent={openComplaintsCount} color="warning">
                <ReportProblemIcon sx={{ fontSize: 20 }} />
              </Badge>
            } 
            iconPosition="start" 
            label="4. Complaints" 
          />
          <Tab icon={<ForumIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="5. Messages & Chat" />
          <Tab icon={<SportsSoccerIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="6. Sports" />
          <Tab icon={<EventAvailableIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="7. Events" />
          <Tab 
            icon={isKindergarten ? <EmojiEventsIcon sx={{ fontSize: 20 }} /> : <ScienceIcon sx={{ fontSize: 20 }} />} 
            iconPosition="start" 
            label={isKindergarten ? "8. Activities & Rhymes" : "8. Labs"} 
          />
          <Tab icon={<EmojiEventsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="9. Curricular Clubs" />
          <Tab icon={<SchoolIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="10. Assigned Staff" />
          <Tab icon={<FamilyRestroomIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="11. Linked Parent" />
          <Tab 
            icon={
              <Badge color="primary" variant="dot">
                <HotelIcon sx={{ fontSize: 20 }} />
              </Badge>
            } 
            iconPosition="start" 
            label="12. Hostel & Mess" 
          />
        </Tabs>
      </Card>

      {/* ================= TAB 0: OVERVIEW HUB ================= */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Official Office Circulars Alert Banner */}
          {circulars.length > 0 && (
            <Grid item xs={12}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3.5, 
                  bgcolor: '#0f172a', 
                  color: '#ffffff',
                  boxShadow: '0 8px 24px -4px rgba(15,23,42,0.2)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CampaignIcon sx={{ color: '#fbbf24', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.3px' }}>
                      Official School Circulars & Notice Board ({circulars.length})
                    </Typography>
                  </Box>
                  <Chip label="Published by Office Admin" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 700 }} />
                </Box>

                <Grid container spacing={2}>
                  {circulars.slice(0, 3).map(c => (
                    <Grid item xs={12} md={4} key={c.id}>
                      <Paper
                        elevation={0}
                        onClick={() => setActiveCircular(c)}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.14)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip label={c.circularNo} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#f59e0b', color: '#0f172a' }} />
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>{c.publishDate}</Typography>
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: '#ffffff', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {c.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#cbd5e1', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                          {c.summary}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, display: 'block', mt: 1 }}>
                          Read Full Notice →
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Quick Access Portals: Adaptive for Kindergarten vs Higher Secondary */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {!isKindergarten ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<SchoolIcon />}
                    onClick={() => navigate('/student-portal/public-exams')}
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderColor: '#0284c7',
                      color: '#0284c7',
                      bgcolor: '#f0f9ff',
                      px: 2.5,
                      py: 1,
                      '&:hover': { bgcolor: '#e0f2fe' }
                    }}
                  >
                    Higher Secondary Board Exam Hall Ticket & Roll No
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<WorkspacePremiumIcon />}
                    onClick={() => navigate('/student-portal/no-due')}
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderColor: '#059669',
                      color: '#059669',
                      bgcolor: '#f0fdf4',
                      px: 2.5,
                      py: 1,
                      '&:hover': { bgcolor: '#dcfce7' }
                    }}
                  >
                    My Department Clearance & No Due Certificate
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EmojiEventsIcon />}
                    onClick={() => setActiveTab(8)}
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 800,
                      textTransform: 'none',
                      borderColor: '#f59e0b',
                      color: '#b45309',
                      bgcolor: '#fef3c7',
                      px: 2.5,
                      py: 1,
                      '&:hover': { bgcolor: '#fde68a' }
                    }}
                  >
                    🎨 Rhymes & Storytime Corner
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<StarIcon />}
                    onClick={() => setActiveTab(8)}
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 800,
                      textTransform: 'none',
                      borderColor: '#ec4899',
                      color: '#be185d',
                      bgcolor: '#fdf2f8',
                      px: 2.5,
                      py: 1,
                      '&:hover': { bgcolor: '#fce7f3' }
                    }}
                  >
                    ⭐ My Golden Star Badges & Stickers
                  </Button>
                </>
              )}

              <Button
                variant="contained"
                startIcon={<HotelIcon />}
                onClick={() => setActiveTab(12)}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: '#1e3a8a',
                  color: '#ffffff',
                  px: 2.5,
                  py: 1,
                  boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
                  '&:hover': { bgcolor: '#172554' }
                }}
              >
                Hostel Resident Hub: Meals, In/Out Passes & Warden
              </Button>
            </Box>
          </Grid>

          {/* Quick Metrics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Pending Homeworks</Typography>
                <Avatar sx={{ bgcolor: '#fee2e2', color: '#ef4444', width: 36, height: 36 }}>
                  <AssignmentIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={800} color="#ef4444">{pendingHomeworkCount}</Typography>
              <Typography variant="caption" color="text.secondary">Tasks due this academic week</Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Cumulative Marks</Typography>
                <Avatar sx={{ bgcolor: '#ecfdf5', color: '#10b981', width: 36, height: 36 }}>
                  <AssessmentIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={800} color="#10b981">{results.totalPercentage}%</Typography>
              <Typography variant="caption" color="text.secondary">{results.overallGrade} • Rank #3</Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Enrolled Sports Teams</Typography>
                <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 36, height: 36 }}>
                  <SportsSoccerIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={800} color="#3b82f6">{sports.enrolledTeams.length}</Typography>
              <Typography variant="caption" color="text.secondary">Lions Football Squad & Athletics</Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Curricular Clubs</Typography>
                <Avatar sx={{ bgcolor: '#faf5ff', color: '#a855f7', width: 36, height: 36 }}>
                  <EmojiEventsIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={800} color="#a855f7">{curricular.enrolledClubs.length}</Typography>
              <Typography variant="caption" color="text.secondary">Robotics, Debate & Eco Club</Typography>
            </Card>
          </Grid>

          {/* Quick Schedule & Highlight Feed */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>⚡ Action Items & Urgent Homeworks</Typography>
                <Button size="small" onClick={() => setActiveTab(1)}>View All ({homeworks.length})</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {homeworks.slice(0, 3).map((hw: any) => (
                  <Box key={hw.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip label={hw.subject} size="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={700}>{hw.title}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Due: {hw.dueDate} • Assigned by: {hw.teacher} • Points: {hw.points}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {hw.status === 'PENDING' ? (
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={() => { setSelectedHw(hw); setHwModalOpen(true); }}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                          Submit
                        </Button>
                      ) : (
                        <Chip label={hw.status} color="success" size="small" icon={<CheckCircleIcon />} />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Key Contacts Sidebar: Linked Parent & Class Teacher */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Linked Parent Card */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#3b82f6', width: 44, height: 44 }}>
                    <FamilyRestroomIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>LINKED PRIMARY GUARDIAN</Typography>
                    <Typography variant="h6" fontWeight={800}>{parent.firstName} {parent.lastName}</Typography>
                  </Box>
                  <Chip label={parent.relationship} size="small" color="primary" sx={{ ml: 'auto' }} />
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PhoneIcon fontSize="small" color="action" /> {parent.mobile}
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" /> {parent.email}
                </Typography>
              </Paper>

              {/* Class Teacher Card */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Avatar src={assignedStaff.classTeacher.avatar} sx={{ width: 44, height: 44, border: '2px solid #a855f7' }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>ASSIGNED CLASS TEACHER</Typography>
                    <Typography variant="h6" fontWeight={800}>{assignedStaff.classTeacher.name.split(',')[0]}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LocationOnIcon fontSize="small" color="action" /> {assignedStaff.classTeacher.room}
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" /> {assignedStaff.classTeacher.officeHours}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => setActiveTab(5)} 
                  sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                >
                  Send Message to Teacher
                </Button>
              </Paper>
            </Box>
          </Grid>

          {/* Quick Access & Student Services Hub */}
          <Grid item xs={12}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                Quick Access & Student Services
              </Typography>
              <Grid container spacing={2}>
                {[
                  { title: 'Transport Tracking', desc: 'Live bus GPS & route', icon: <DirectionsBusIcon sx={{ fontSize: 26 }} />, color: '#10b981', route: '/student-portal/transport' },
                  { title: 'Library & Books', desc: 'Catalog & active loans', icon: <LocalLibraryIcon sx={{ fontSize: 26 }} />, color: '#8b5cf6', route: '/student-portal/library' },
                  { title: 'Class Timetable', desc: 'Daily schedule & slots', icon: <CalendarMonthIcon sx={{ fontSize: 26 }} />, color: '#f97316', route: '/student-portal/timetable' },
                  { title: 'Attendance Profile', desc: 'Logs & monthly report', icon: <EventAvailableIcon sx={{ fontSize: 26 }} />, color: '#06b6d4', route: '/student-portal/attendance' },
                  { title: 'Marks & Results', desc: 'Exam grades & dossier', icon: <AssessmentIcon sx={{ fontSize: 26 }} />, color: '#ec4899', route: '/student-portal/marks' },
                  { title: 'LMS Learning Hub', desc: 'Courseware & online classes', icon: <SchoolIcon sx={{ fontSize: 26 }} />, color: '#3b82f6', route: '/lms/student/dashboard' },
                  { title: 'Fee Status', desc: 'Fee ledger & dues', icon: <PaymentIcon sx={{ fontSize: 26 }} />, color: '#14b8a6', route: '/student-portal/fees' },
                  { title: 'Portal Settings', desc: 'Student profile & security', icon: <SettingsIcon sx={{ fontSize: 26 }} />, color: '#64748b', route: '/student-portal/settings' },
                ].map((item, idx) => (
                  <Grid item xs={6} sm={4} md={3} key={idx}>
                    <Paper 
                      elevation={0}
                      onClick={() => navigate(item.route)}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 1,
                        bgcolor: '#ffffff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 16px -4px rgba(0,0,0,0.08)',
                          borderColor: item.color
                        }
                      }}
                    >
                      <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{item.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: { xs: 'none', sm: 'block' } }}>{item.desc}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* ================= TAB 1: HOMEWORKS ================= */}
      {activeTab === 1 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Homeworks & Daily Assignments</Typography>
              <Typography variant="body2" color="text.secondary">Review assigned tasks, deadlines, submission records, and teacher grading remarks</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2.5}>
            {homeworks.map((hw: any) => (
              <Grid item xs={12} md={6} key={hw.id}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label={hw.subject} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Chip 
                      label={hw.status} 
                      color={hw.status === 'PENDING' ? 'warning' : 'success'} 
                      size="small" 
                      icon={hw.status !== 'PENDING' ? <CheckCircleIcon /> : undefined}
                      sx={{ fontWeight: 700 }} 
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{hw.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                    {hw.description}
                  </Typography>

                  {hw.teacherRemarks && (
                    <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0', mb: 2 }}>
                      <Typography variant="caption" fontWeight={700} color="#15803d">Teacher Feedback:</Typography>
                      <Typography variant="body2" color="#166534">{hw.teacherRemarks}</Typography>
                    </Box>
                  )}

                  <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Due: <strong>{hw.dueDate}</strong> • Weight: <strong>{hw.points}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Teacher: {hw.teacher}
                      </Typography>
                    </Box>
                    {hw.status === 'PENDING' ? (
                      <Button 
                        size="small" 
                        variant="contained" 
                        onClick={() => { setSelectedHw(hw); setHwModalOpen(true); }}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Submit Work
                      </Button>
                    ) : (
                      <Typography variant="caption" color="success.main" fontWeight={700}>
                        ✓ Submitted
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ================= TAB 2: RESULTS & MARKS ================= */}
      {activeTab === 2 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Academic Results & Marks Transcript</Typography>
              <Typography variant="body2" color="text.secondary">Subject-wise marks distribution, grades, class highest benchmarks, and cumulative GPA</Typography>
            </Box>
            <Button variant="outlined" onClick={() => window.print()} sx={{ borderRadius: 2, textTransform: 'none' }}>
              Print Official Transcript
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Summary Score Ribbon */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'space-around' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>ASSESSMENT TERM</Typography>
              <Typography variant="h6" fontWeight={800} color="#15803d">{results.term}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL SCORE</Typography>
              <Typography variant="h6" fontWeight={800} color="#15803d">{results.totalScored} / {results.totalMaxMarks}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>CUMULATIVE PERCENTAGE</Typography>
              <Typography variant="h6" fontWeight={800} color="#15803d">{results.totalPercentage}%</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>GRADE & RANK</Typography>
              <Typography variant="h6" fontWeight={800} color="#15803d">{results.overallGrade} • {results.classRank}</Typography>
            </Box>
          </Paper>

          {/* Subject Breakdown Cards */}
          <Grid container spacing={2.5}>
            {results.subjects.map((sub: any, idx: number) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>{sub.subject}</Typography>
                    <Chip label={`Grade ${sub.grade}`} color={sub.grade.startsWith('A') ? 'success' : 'primary'} sx={{ fontWeight: 800 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                    <Typography variant="h4" fontWeight={800} color="primary.main">{sub.scored}</Typography>
                    <Typography variant="body2" color="text.secondary">/ {sub.max} (Pass: {sub.passMarks})</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      Cohort Highest: <strong>{sub.classHighest}</strong>
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(sub.scored / sub.max) * 100} 
                    sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    "{sub.remarks}"
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ================= TAB 3: ANNOUNCEMENTS ================= */}
      {activeTab === 3 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>School Announcements & Circulars</Typography>
              <Typography variant="body2" color="text.secondary">Official administrative bulletins, event notices, and department advisories</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {announcements.map((ann: any) => (
              <Card key={ann.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={ann.category} size="small" color="primary" sx={{ fontWeight: 700 }} />
                    <Chip 
                      label={ann.priority} 
                      size="small" 
                      color={ann.priority === 'URGENT' ? 'error' : ann.priority === 'HIGH' ? 'warning' : 'default'} 
                      sx={{ fontWeight: 700 }} 
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    📅 {ann.date} at {ann.time} • Issued by: {ann.publishedBy}
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>{ann.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {ann.content}
                </Typography>
              </Card>
            ))}
          </Box>
        </Paper>
      )}

      {/* ================= TAB 4: COMPLAINTS & GRIEVANCES ================= */}
      {activeTab === 4 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Student Grievances & Service Complaints</Typography>
              <Typography variant="body2" color="text.secondary">Track the resolution status of filed academic, facility, or transport requests</Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddCircleIcon />} 
              onClick={() => setComplaintModalOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Raise New Grievance
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {complaints.map((cmp: any) => (
              <Card key={cmp.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}>
                      {cmp.id}
                    </Typography>
                    <Chip label={cmp.category} size="small" />
                    <Chip label={`Priority: ${cmp.priority}`} size="small" variant="outlined" />
                  </Box>
                  <Chip 
                    label={cmp.status} 
                    color={cmp.status === 'RESOLVED' ? 'success' : cmp.status === 'IN_PROGRESS' ? 'warning' : 'error'} 
                    size="small" 
                    sx={{ fontWeight: 800 }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>{cmp.subject}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{cmp.description}</Typography>
                {cmp.resolution && (
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" fontWeight={700} color="primary.main">Resolution / Action Update:</Typography>
                    <Typography variant="body2" color="text.primary">{cmp.resolution}</Typography>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                  Submitted on: {cmp.dateSubmitted}
                </Typography>
              </Card>
            ))}
          </Box>
        </Paper>
      )}

      {/* ================= TAB 5: MESSAGES & CHAT ================= */}
      {activeTab === 5 && (
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3.5 }, borderRadius: 3, border: '1px solid #e2e8f0', maxWidth: 1100, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Teacher-Student Direct Messaging</Typography>
              <Typography variant="body2" color="text.secondary">Select an educator or mentor to discuss academic queries, homework and guidance</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Left: Mentor Selection Column */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 2, bgcolor: '#ffffff', height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#1e293b' }}>
                  Select Teacher / Mentor ({MENTOR_CONTACTS.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {MENTOR_CONTACTS.map((mentor) => {
                    const isSelected = selectedTeacherChat === mentor.name;
                    return (
                      <Box
                        key={mentor.id}
                        onClick={() => setSelectedTeacherChat(mentor.name)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: isSelected ? '#eff6ff' : 'transparent',
                          border: isSelected ? '1.5px solid #3b82f6' : '1px solid #f1f5f9',
                          transition: 'all 0.15s ease',
                          '&:hover': { bgcolor: isSelected ? '#eff6ff' : '#f8fafc' }
                        }}
                      >
                        <Avatar src={mentor.avatar} sx={{ width: 42, height: 42 }}>
                          {mentor.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: isSelected ? '#1d4ed8' : '#1e293b' }} noWrap>
                            {mentor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {mentor.subject}
                          </Typography>
                          <Chip
                            label={mentor.status}
                            size="small"
                            color={mentor.status === 'Online' ? 'success' : 'default'}
                            sx={{ height: 18, fontSize: 10, fontWeight: 700, mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>

            {/* Right: Active Chat Area */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Active Chat Header */}
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    src={MENTOR_CONTACTS.find(m => m.name === selectedTeacherChat)?.avatar}
                    sx={{ width: 40, height: 40 }}
                  >
                    {selectedTeacherChat[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {selectedTeacherChat}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {MENTOR_CONTACTS.find(m => m.name === selectedTeacherChat)?.role || 'Teacher'} • Direct Channel
                    </Typography>
                  </Box>
                </Box>

                {/* Message Stream */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 380, overflowY: 'auto', p: 2.5, bgcolor: '#f8fafc' }}>
                  {messages.map((msg: any) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        alignSelf: msg.isTeacher ? 'flex-start' : 'flex-end',
                        maxWidth: '80%'
                      }}
                    >
                      {msg.isTeacher && (
                        <Avatar src={msg.avatar || MENTOR_CONTACTS.find(m => m.name === selectedTeacherChat)?.avatar} sx={{ width: 36, height: 36 }}>
                          {msg.senderName?.charAt(0)}
                        </Avatar>
                      )}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, justifyContent: msg.isTeacher ? 'flex-start' : 'flex-end' }}>
                          <Typography variant="caption" fontWeight={700} color={msg.isTeacher ? 'primary.main' : 'text.primary'}>
                            {msg.senderName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{msg.timestamp}</Typography>
                        </Box>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: msg.isTeacher ? '16px 16px 16px 2px' : '16px 16px 2px 16px',
                            bgcolor: msg.isTeacher ? '#ffffff' : '#3b82f6',
                            color: msg.isTeacher ? 'text.primary' : '#ffffff',
                            border: msg.isTeacher ? '1px solid #e2e8f0' : 'none',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                          }}
                        >
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.text}</Typography>
                        </Paper>
                      </Box>
                    </Box>
                  ))}
                  <div ref={chatScrollRef} />
                </Box>

                {/* Message Input Box */}
                <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Message ${selectedTeacherChat}...`}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendChatMessage(); }}
                    disabled={sendingMsg}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendChatMessage}
                    disabled={sendingMsg || !chatInput.trim()}
                    sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}
                  >
                    Send
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ================= TAB 6: SPORTS ================= */}
      {activeTab === 6 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Sports, Athletic Squads & Fixtures</Typography>
              <Typography variant="body2" color="text.secondary">Enrolled varsity teams, upcoming interschool match fixtures, training hours, and coaching personnel</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>🏅 Enrolled Teams & Squads</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {sports.enrolledTeams.map((tm: any, idx: number) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label={tm.sport} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Chip label={tm.status} color="success" size="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={800} gutterBottom>{tm.teamName}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>Role:</strong> {tm.role} {tm.jerseyNumber && `• Jersey: ${tm.jerseyNumber}`}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2"><strong>Coach:</strong> {tm.coachName} ({tm.coachContact})</Typography>
                  <Typography variant="body2" color="text.secondary"><strong>Ground / Facility:</strong> {tm.ground}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>📅 Upcoming Match Fixtures & Practice</Typography>
          <Grid container spacing={2.5}>
            {sports.upcomingFixtures.map((fix: any, idx: number) => (
              <Grid item xs={12} md={6} key={idx}>
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{fix.event}</Typography>
                    <Chip label={fix.status} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Vs: <strong>{fix.opponent}</strong> • <strong>{fix.date} at {fix.time}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    📍 {fix.venue}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ================= TAB 7: EVENTS ================= */}
      {activeTab === 7 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>School Events, Hackathons & Exhibitions</Typography>
              <Typography variant="body2" color="text.secondary">Explore campus activities, innovation symposiums, and RSVP for event participation</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {events.map((evt: any) => (
              <Grid item xs={12} md={6} key={evt.id}>
                <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label={evt.category} size="small" color="secondary" sx={{ fontWeight: 700 }} />
                    <Chip 
                      label={evt.isRegistered ? 'Registered ✓' : 'Registration Open'} 
                      color={evt.isRegistered ? 'success' : 'default'} 
                      size="small" 
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{evt.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                    {evt.description}
                  </Typography>
                  <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CalendarMonthIcon fontSize="small" color="action" /> {evt.date} • {evt.time}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationOnIcon fontSize="small" color="action" /> {evt.venue}
                    </Typography>
                    <Button 
                      fullWidth 
                      variant={evt.isRegistered ? 'outlined' : 'contained'} 
                      color={evt.isRegistered ? 'error' : 'primary'}
                      onClick={() => handleToggleEventRSVP(evt.id)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      {evt.isRegistered ? 'Cancel RSVP' : 'Register for Event'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ================= TAB 8: LABS / KINDERGARTEN ACTIVITIES ================= */}
      {activeTab === 8 && (
        isKindergarten ? (
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #fde68a', bgcolor: '#fffbeb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#92400e' }}>
                  🎨 Kindergarten Early Childhood Hub & Activities
                </Typography>
                <Typography variant="body2" sx={{ color: '#b45309' }}>
                  Age-appropriate rhymes, creative drawing, sensory games, and daily nap & nutrition tracking
                </Typography>
              </Box>
              <Chip label="Kindergarten Special" sx={{ bgcolor: '#f59e0b', color: '#ffffff', fontWeight: 800 }} />
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {[
                { title: 'Twinkle Twinkle & Phonics ABC', category: 'Rhyme & Song', desc: 'Audio sing-along with cute animated puppets and alphabet phonics.', stars: '⭐⭐⭐' },
                { title: 'Color Matching & Finger Painting', category: 'Creative Play', desc: 'Identify primary colors, hand-print trees, and clay modeling fun.', stars: '⭐⭐⭐⭐' },
                { title: 'Number Counting 1-20 & Fruit Basket', category: 'Early Math', desc: 'Interactive visual count of apples, bananas, and playful toys.', stars: '⭐⭐⭐' },
                { title: 'Animal Sounds & Habitat Safari', category: 'Discovery', desc: 'Listen to lion roars, bird chirps, and mimic gentle farm animals.', stars: '⭐⭐⭐⭐' },
                { title: 'Gentle Nap & Hydration Diary', category: 'Daily Care', desc: 'Afternoon rest from 12:45 PM to 1:45 PM logged by Kindergarten nanny.', stars: 'Completed' },
                { title: 'Golden Star Behavior Rewards', category: 'Good Habits', desc: 'Earned 5 star badges this week for sharing crayons and tidy desk.', stars: '5 Badges' }
              ].map((act, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fed7aa', bgcolor: '#ffffff', height: '100%' }}>
                    <Chip label={act.category} size="small" sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 700, mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                      {act.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem', mb: 2 }}>
                      {act.desc}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px dashed #fed7aa' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#f59e0b' }}>{act.stars}</Typography>
                      <Button size="small" variant="contained" sx={{ bgcolor: '#f59e0b', color: '#fff', textTransform: 'none', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#d97706' } }}>
                        Open Activity
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        ) : (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Laboratories & Practical Sessions</Typography>
              <Typography variant="body2" color="text.secondary">Dedicated workstation slots, scheduled laboratory experiments, and safety protocols</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {labs.map((lb: any) => (
              <Grid item xs={12} md={4} key={lb.id}>
                <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#e0f2fe', color: '#0284c7' }}>
                      <ScienceIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>{lb.labType} LAB</Typography>
                      <Typography variant="h6" fontWeight={700}>{lb.name}</Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}><strong>Location:</strong> {lb.room}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}><strong>In-Charge:</strong> {lb.inCharge}</Typography>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', my: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="primary.main">NEXT PRACTICAL SESSION:</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>{lb.nextSession.day} • {lb.nextSession.time}</Typography>
                    <Typography variant="body2" color="text.secondary">Topic: {lb.nextSession.topic}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      ⚙️ {lb.nextSession.equipmentAssigned}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    <strong>Safety Note:</strong> {lb.safetyGuidelines}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Teacher Practical Observation Manuals */}
          <Box sx={{ mt: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Laboratory Practical Observations & Manuals ({observations.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Download or preview observation guides posted by your subject teachers in Word (.docx) or PDF (.pdf) format.
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2.5}>
              {observations.map(obs => {
                const isPdf = obs.format === 'PDF';
                return (
                  <Grid item xs={12} md={6} key={obs.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        bgcolor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%'
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip label={obs.labSubject} size="small" sx={{ fontWeight: 800, bgcolor: '#e0f2fe', color: '#0369a1' }} />
                          <Chip
                            label={obs.format}
                            size="small"
                            icon={isPdf ? <PictureAsPdfIcon fontSize="small" /> : <DescriptionIcon fontSize="small" />}
                            sx={{ fontWeight: 700, bgcolor: isPdf ? '#fee2e2' : '#e0e7ff', color: isPdf ? '#991b1b' : '#3730a3' }}
                          />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                          {obs.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#475569', mb: 1, fontSize: '0.85rem' }}>
                          <strong>Aim:</strong> {obs.aim}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          <strong>Instructor:</strong> {obs.postedByTeacher} • <strong>Due:</strong> {obs.submissionDueDate}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" color="text.secondary">
                          {obs.fileName} ({obs.fileSize})
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon fontSize="small" />}
                            onClick={() => setPreviewDoc({
                              id: obs.id,
                              documentType: `Practical Observation (${obs.labSubject})`,
                              fileName: obs.fileName,
                              fileUrl: obs.fileUrl,
                              fileSize: obs.fileSize,
                              uploadDate: obs.postedDate,
                              verificationStatus: 'VERIFIED',
                              ownerName: obs.postedByTeacher,
                              ownerRole: `${obs.className} • ${obs.streamGroup}`,
                              ownerId: `Due: ${obs.submissionDueDate}`,
                              remarks: `AIM: ${obs.aim}\n\nAPPARATUS: ${obs.apparatusRequired}\n\nFORMULA: ${obs.formula}`,
                              verifiedBy: 'Senior Laboratory Faculty & Academic Head'
                            })}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#0f766e', bgcolor: '#ccfbf1', '&:hover': { bgcolor: '#99f6e4' } }}
                          >
                            View
                          </Button>

                          <Button
                            size="small"
                            startIcon={<FileDownloadIcon fontSize="small" />}
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = obs.fileUrl;
                              a.download = obs.fileName;
                              a.target = '_blank';
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}
                            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#2563eb' }}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Paper>
        )
      )}

      {/* ================= TAB 9: CURRICULAR CLUBS & BADGES ================= */}
      {activeTab === 9 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Co-Curricular Activities & Societies</Typography>
              <Typography variant="body2" color="text.secondary">Enrolled student clubs, society leadership positions, meeting agendas, and earned merit citations</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>🌟 Enrolled Clubs & Societies</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {curricular.enrolledClubs.map((club: any) => (
              <Grid item xs={12} md={4} key={club.id}>
                <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label={club.category} size="small" color="secondary" />
                    <Chip label={club.badge} size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{club.name}</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={600} sx={{ mb: 1.5 }}>
                    {club.role}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Faculty Mentor:</strong> {club.mentor}</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Schedule:</strong> {club.meetingSchedule}</Typography>
                  <Typography variant="body2" color="text.secondary"><strong>Location:</strong> {club.room}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>🏅 Badges & Honors Earned</Typography>
          <Grid container spacing={2.5}>
            {curricular.honorsAndBadges.map((badge: any, idx: number) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EmojiEventsIcon sx={{ color: '#16a34a', fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#166534">{badge.title}</Typography>
                    <Typography variant="caption" color="#15803d">{badge.category} • {badge.year}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ================= TAB 10: ASSIGNED STAFF & TEACHERS ================= */}
      {activeTab === 10 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Assigned Faculty & Teachers Directory</Typography>
              <Typography variant="body2" color="text.secondary">Class teacher coordinator, subject specialist educators, room allocations, and direct contacts</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Primary Class Teacher Feature */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, borderRadius: 3, bgcolor: '#f8fafc', border: '2px solid #e2e8f0' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm="auto">
                <Avatar src={assignedStaff.classTeacher.avatar} sx={{ width: 88, height: 88, border: '3px solid white', boxShadow: 2 }} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Chip label="CLASS TEACHER & ACADEMIC MENTOR" color="primary" size="small" sx={{ fontWeight: 800, mb: 1 }} />
                <Typography variant="h5" fontWeight={800}>{assignedStaff.classTeacher.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  {assignedStaff.classTeacher.role} • 📍 {assignedStaff.classTeacher.room}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EmailIcon fontSize="small" color="action" /> {assignedStaff.classTeacher.email}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneIcon fontSize="small" color="action" /> {assignedStaff.classTeacher.phone}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" color="action" /> {assignedStaff.classTeacher.officeHours}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm="auto" sx={{ ml: 'auto' }}>
                <Button variant="contained" onClick={() => { setSelectedTeacherChat('Mrs. Radhika Iyer'); setActiveTab(5); }} sx={{ borderRadius: 2, textTransform: 'none' }} startIcon={<ForumIcon />}>
                  Message Class Teacher
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Subject Teachers Grid */}
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>📚 Subject Specialist Teachers</Typography>
          <Grid container spacing={2.5}>
            {assignedStaff.subjectTeachers.map((st: any, idx: number) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip label={st.subject} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{st.periodsPerWeek}</Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700}>{st.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    📍 Room: {st.room}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">📞 {st.phone}</Typography>
                    <Typography variant="caption" color="text.secondary">✉️ {st.email}</Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth 
                    startIcon={<ForumIcon />}
                    onClick={() => { setSelectedTeacherChat(st.name); setActiveTab(5); }} 
                    sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Chat with Teacher
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ================= TAB 11: LINKED PARENT ================= */}
      {activeTab === 11 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Linked Parent & Family Contacts</Typography>
              <Typography variant="body2" color="text.secondary">Registered primary guardian, verified phone numbers, and emergency communication route</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Card elevation={0} sx={{ p: 4, borderRadius: 4, border: '2px solid #e2e8f0', bgcolor: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm="auto">
                <Avatar sx={{ width: 84, height: 84, bgcolor: '#3b82f6', fontSize: '2rem' }}>
                  <FamilyRestroomIcon fontSize="large" />
                </Avatar>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Typography variant="h5" fontWeight={800}>{parent.firstName} {parent.lastName}</Typography>
                  <Chip label={parent.relationship?.toUpperCase() || 'FATHER'} color="primary" size="small" sx={{ fontWeight: 800 }} />
                  {parent.isEmergencyContact && (
                    <Chip label="Primary Emergency Contact" color="error" size="small" sx={{ fontWeight: 700 }} />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Designated authorized guardian on school record for student <strong>{student.firstName} {student.lastName}</strong>
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>REGISTERED MOBILE NUMBER</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="primary" /> {parent.mobile}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>REGISTERED EMAIL ADDRESS</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                    <EmailIcon color="primary" /> {parent.email}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>RESIDENTIAL / REGISTERED CAMPUS ADDRESS</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon color="action" /> {parent.address}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Paper>
      )}

      {/* ================= TAB 12: HOSTEL RESIDENT WING & MESS ================= */}
      {activeTab === 12 && (
        <HostelStudentSection student={student} parent={parent} />
      )}

      {/* ================= MODAL: SUBMIT HOMEWORK ================= */}
      <Dialog open={hwModalOpen} onClose={() => setHwModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Submit Homework: {selectedHw?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Subject: <strong>{selectedHw?.subject}</strong> • Due: <strong>{selectedHw?.dueDate}</strong>
            </Typography>
            <Typography variant="body2">
              {selectedHw?.description}
            </Typography>
            <TextField
              label="Submission Notes / Solution Text / Links"
              multiline
              rows={4}
              fullWidth
              value={submissionText}
              onChange={e => setSubmissionText(e.target.value)}
              placeholder="Paste answers, solution summary, or submission drive link here..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setHwModalOpen(false)} disabled={submittingHw}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitHomework} 
            disabled={submittingHw || !submissionText.trim()}
          >
            {submittingHw ? 'Submitting...' : 'Confirm Submission'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: RAISE GRIEVANCE / COMPLAINT ================= */}
      <Dialog open={complaintModalOpen} onClose={() => setComplaintModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Raise New Student Grievance / Complaint
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField 
              label="Subject / Issue Title" 
              fullWidth 
              value={complaintForm.subject} 
              onChange={e => setComplaintForm({ ...complaintForm, subject: e.target.value })}
              placeholder="e.g. Science lab equipment replacement request"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select 
                value={complaintForm.category} 
                label="Category"
                onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}
              >
                <MenuItem value="ACADEMIC">Academic / Curriculum</MenuItem>
                <MenuItem value="INFRASTRUCTURE">Campus Infrastructure & Facilities</MenuItem>
                <MenuItem value="TRANSPORT">School Transport & Bus</MenuItem>
                <MenuItem value="HOSTEL">Hostel & Dining</MenuItem>
                <MenuItem value="OTHER">Other Request</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select 
                value={complaintForm.priority} 
                label="Priority"
                onChange={e => setComplaintForm({ ...complaintForm, priority: e.target.value })}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High / Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Detailed Description" 
              multiline 
              rows={4} 
              fullWidth 
              value={complaintForm.description} 
              onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
              placeholder="Provide specific details so staff can address it quickly..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setComplaintModalOpen(false)} disabled={submittingComplaint}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleRaiseComplaint} 
            disabled={submittingComplaint || !complaintForm.subject || !complaintForm.description}
          >
            {submittingComplaint ? 'Submitting...' : 'Submit Grievance'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* READ CIRCULAR DIALOG FOR STUDENTS */}
      <Dialog
        open={Boolean(activeCircular)}
        onClose={() => setActiveCircular(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3.5 } } }}
      >
        {activeCircular && (
          <>
            <DialogTitle sx={{ fontWeight: 800, bgcolor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Official School Circular • {activeCircular.circularNo}</span>
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
                    📎 Attached Official Reference: {activeCircular.attachmentName} ({activeCircular.attachmentSize})
                  </Typography>
                </Paper>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Button onClick={() => window.print()} variant="outlined" sx={{ textTransform: 'none', fontWeight: 700 }}>
                Print Circular
              </Button>
              <Button onClick={() => setActiveCircular(null)} variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 700 }}>
                Done Reading
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* IN-APP DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />

      {/* QUICK LEAVE REQUEST MODAL (STUDENT DIRECT TO PRINCIPAL) */}
      <QuickLeaveRequestModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        defaultRole="STUDENT"
        applicantName={`${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Student User'}
      />

      {/* DIRECT PRINCIPAL QUERY MODAL */}
      <PrincipalQueryModal
        open={queryModalOpen}
        onClose={() => setQueryModalOpen(false)}
        senderRole="STUDENT"
        senderName={`${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Advik A (Student)'}
      />
    </Box>
  );
};

export default StudentPortalDashboard;
