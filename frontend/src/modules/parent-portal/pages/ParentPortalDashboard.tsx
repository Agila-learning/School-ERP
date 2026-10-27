import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Avatar, Chip, CircularProgress,
  Select, MenuItem, FormControl, Button, Card, CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FaceIcon from '@mui/icons-material/Face';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GradeIcon from '@mui/icons-material/Grade';
import ForumIcon from '@mui/icons-material/Forum';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SettingsIcon from '@mui/icons-material/Settings';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SendIcon from '@mui/icons-material/Send';
import { QuickLeaveRequestModal } from '../../../shared/components/QuickLeaveRequestModal';
import { PrincipalQueryModal } from '../../../shared/components/PrincipalQueryModal';
import { useParentContext } from '../context/ParentContext';
import api from '../../../core/api/axios';

const ParentPortalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    childrenProfiles, 
    selectedChildId, 
    selectedChild, 
    parentInfo,
    allParents,
    selectedParentId,
    isLoading, 
    setSelectedChildId,
    setSelectedParentId
  } = useParentContext();

  const [childStats, setChildStats] = useState<{
    attendancePct: number;
    feeDue: number;
    assignmentCount: number;
    loading: boolean;
  }>({
    attendancePct: 0,
    feeDue: 0,
    assignmentCount: 0,
    loading: false
  });
  const [absenceAlert, setAbsenceAlert] = useState<any>(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [queryModalOpen, setQueryModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedChild) return;
    const sId = selectedChild.studentId || selectedChild._id;
    let isMounted = true;
    setChildStats(prev => ({ ...prev, loading: true }));

    Promise.allSettled([
      api.get(`/parent-portal/children/${sId}/attendance`),
      api.get(`/parent-portal/children/${sId}/fees`),
      api.get(`/parent-portal/children/${sId}/academic`)
    ]).then(([attRes, feeRes, acadRes]) => {
      if (!isMounted) return;
      const attData = attRes.status === 'fulfilled' ? attRes.value.data?.data : null;
      const feeData = feeRes.status === 'fulfilled' ? feeRes.value.data?.data : null;
      const acadData = acadRes.status === 'fulfilled' ? acadRes.value.data?.data : null;

      setChildStats({
        attendancePct: attData?.percentage ?? 0,
        feeDue: feeData?.totalDue ?? 0,
        assignmentCount: acadData?.assignments?.length ?? 0,
        loading: false
      });

      if (attData?.isAbsentToday || attData?.latestAbsence) {
        setAbsenceAlert(attData.latestAbsence ? {
          isToday: !!attData.isAbsentToday,
          date: attData.latestAbsence.date,
          remarks: attData.latestAbsence.remarks
        } : null);
      } else {
        setAbsenceAlert(null);
      }
    });

    return () => { isMounted = false; };
  }, [selectedChild]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Area */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', 
        borderRadius: 3, p: 3, mb: 4, color: 'white', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
        position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <Box sx={{ zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Parent Portal</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {parentInfo 
              ? `Logged in as: ${parentInfo.firstName} ${parentInfo.lastName} (${parentInfo.relationship || 'Guardian'})`
              : 'Manage academics, fees, and tracking for your child.'}
          </Typography>
        </Box>
        
        {/* Switchers (Parent & Child) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', zIndex: 1 }}>
          {/* Parent Switcher (Useful when admin/staff or testing multiple parents) */}
          {allParents.length > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.18)', px: 1.5, py: 0.8, borderRadius: 2 }}>
              <PersonIcon sx={{ fontSize: 18, color: 'white' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'white', display: { xs: 'none', sm: 'inline' } }}>Parent:</Typography>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={selectedParentId || parentInfo?._id || ''}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  sx={{ 
                    color: 'white', 
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  {allParents.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.firstName} {p.lastName} {p.relationship ? `(${p.relationship})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Child Switcher Dropdown */}
          {childrenProfiles.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.22)', px: 1.5, py: 0.8, borderRadius: 2 }}>
              <FaceIcon sx={{ fontSize: 18, color: 'white' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'white', display: { xs: 'none', sm: 'inline' } }}>Child:</Typography>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={selectedChildId || ''}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  sx={{ 
                    color: 'white', 
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  {childrenProfiles.map(child => (
                    <MenuItem key={child.studentId || child._id} value={child.studentId || child._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 22, height: 22, fontSize: 11 }}>
                          {child.firstName?.charAt(0)}
                        </Avatar>
                        {child.firstName} {child.lastName}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </Box>

      {/* No Students Linked Fallback */}
      {childrenProfiles.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', color: 'text.secondary', maxWidth: 640, mx: 'auto', mb: 4 }}>
          <FaceIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1, color: '#1e293b', fontWeight: 700 }}>
            No Students Linked to {parentInfo?.firstName || 'this Parent'}
          </Typography>
          <Typography sx={{ mb: 3 }}>
            There are currently no students linked with this parent profile under Guardian Relationships.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              startIcon={<LinkIcon />}
              onClick={() => navigate('/students/parents')}
              sx={{ bgcolor: '#2563eb', textTransform: 'none', fontWeight: 600 }}
            >
              Link Students in Parent Management
            </Button>
            {allParents.length > 1 && (
              <Button 
                variant="outlined" 
                onClick={() => {
                  const other = allParents.find(p => p._id !== (parentInfo?._id || selectedParentId));
                  if (other) setSelectedParentId(other._id);
                }}
                sx={{ textTransform: 'none' }}
              >
                Switch to Another Parent
              </Button>
            )}
          </Box>
        </Paper>
      ) : (
        <>
          {/* Selected Child Profile Overview */}
          {selectedChild && (
            <Paper elevation={0} sx={{ 
              p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 4,
              display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center'
            }}>
              <Avatar 
                src={selectedChild.photoUrl} 
                sx={{ width: 84, height: 84, bgcolor: '#eff6ff', color: '#3b82f6', fontSize: 32, fontWeight: 'bold' }}
              >
                {selectedChild.firstName?.charAt(0)}{selectedChild.lastName?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {selectedChild.firstName} {selectedChild.lastName}
                  </Typography>
                  <Chip size="small" color="success" variant="outlined" label="Active Student" sx={{ fontWeight: 600 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Student ID: <strong>{selectedChild.admissionNumber || selectedChild.studentIdNumber || selectedChild.studentId}</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`Class: ${selectedChild.class || 'Class 10'} - ${selectedChild.section || 'A'}`} sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
                  <Chip size="small" label={`Roll No: ${selectedChild.rollNumber || '01'}`} sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
                  {selectedChild.gender && (
                    <Chip size="small" label={`Gender: ${selectedChild.gender}`} sx={{ bgcolor: '#f1f5f9' }} />
                  )}
                  {selectedChild.currentEnrollmentId?.academicYearId && (
                    <Chip size="small" color="primary" variant="outlined" label={`Year: ${selectedChild.currentEnrollmentId.academicYearId.name}`} sx={{ fontWeight: 600 }} />
                  )}
                </Box>
              </Box>

              {/* Quick Child Metrics Cards */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Card variant="outlined" sx={{ minWidth: 130, bgcolor: '#ecfdf5', borderColor: '#a7f3d0' }}>
                  <CardContent sx={{ p: '12px !important' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Attendance</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
                      {childStats.attendancePct}%
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ minWidth: 130, bgcolor: childStats.feeDue > 0 ? '#fff1f2' : '#f0fdf4', borderColor: childStats.feeDue > 0 ? '#fecdd3' : '#bbf7d0' }}>
                  <CardContent sx={{ p: '12px !important' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Fee Balance</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: childStats.feeDue > 0 ? '#e11d48' : '#16a34a' }}>
                      ₹{childStats.feeDue.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ minWidth: 130, bgcolor: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <CardContent sx={{ p: '12px !important' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Assignments</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#2563eb' }}>
                      {childStats.assignmentCount} Due
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          )}

          {/* Absence Alert Banner */}
          {absenceAlert && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                mb: 3.5, 
                borderRadius: 3, 
                bgcolor: '#fff1f2', 
                border: '1.5px solid #fecdd3',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ReportProblemIcon sx={{ fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#9f1239' }}>
                    {absenceAlert.isToday ? '⚠️ Daily Attendance Alert: Marked ABSENT Today' : '⚠️ Student Absence Notice'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#be123c', mt: 0.2 }}>
                    {selectedChild?.firstName} was recorded as <strong>ABSENT</strong> on <strong>{new Date(absenceAlert.date).toLocaleDateString()}</strong> by the class teacher. 
                    {absenceAlert.remarks ? ` Reason/Remarks: "${absenceAlert.remarks}".` : ' No prior leave notification received.'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
                <Button 
                  variant="contained" 
                  size="small" 
                  color="error" 
                  onClick={() => navigate('/parent-portal/attendance')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  View Attendance
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => navigate('/parent-portal/messages')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#be123c', borderColor: '#fecdd3' }}
                >
                  Contact Teacher
                </Button>
              </Box>
            </Paper>
          )}

          {/* Executive Direct Action Bar */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Executive Parent Helpdesk & Direct Actions
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Directly communicate with Principal, submit student leave requests, or access Referral Rewards.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<CalendarMonthIcon />}
                onClick={() => setLeaveModalOpen(true)}
                sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2, py: 0.8 }}
              >
                Apply Student Leave
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<SendIcon />}
                onClick={() => setQueryModalOpen(true)}
                sx={{ bgcolor: '#0f766e', '&:hover': { bgcolor: '#115e59' }, textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2, py: 0.8 }}
              >
                Ask Principal (Direct Desk)
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<CardGiftcardIcon />}
                onClick={() => navigate('/career/referrals')}
                sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2, py: 0.8 }}
              >
                Referral Rewards Hub
              </Button>
            </Box>
          </Paper>

          {/* Quick Navigation Cards */}
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>Quick Actions & Services</Typography>
          <Grid container spacing={2.5}>
            {[
              { title: 'Apply Student Leave', icon: <CalendarMonthIcon sx={{ fontSize: 30 }} />, color: '#4f46e5', onClick: () => setLeaveModalOpen(true) },
              { title: 'Ask Principal Desk', icon: <SendIcon sx={{ fontSize: 30 }} />, color: '#0f766e', onClick: () => setQueryModalOpen(true) },
              { title: 'Referral Rewards Hub', icon: <CardGiftcardIcon sx={{ fontSize: 30 }} />, color: '#d97706', route: '/career/referrals' },
              { title: 'Homework & Assignments', icon: <AssignmentIcon sx={{ fontSize: 30 }} />, color: '#f59e0b', route: '/parent-portal/homework' },
              { title: 'Attendance Record', icon: <EventAvailableIcon sx={{ fontSize: 30 }} />, color: '#10b981', route: '/parent-portal/attendance' },
              { title: 'Library & Books', icon: <MenuBookIcon sx={{ fontSize: 30 }} />, color: '#8b5cf6', route: '/parent-portal/library' },
              { title: 'Fee Payments', icon: <PaymentIcon sx={{ fontSize: 30 }} />, color: '#06b6d4', route: '/parent-portal/fees' },
              { title: 'Marks & Results', icon: <GradeIcon sx={{ fontSize: 30 }} />, color: '#ec4899', route: '/parent-portal/marks' },
              { title: 'Meetings & PTM', icon: <MeetingRoomIcon sx={{ fontSize: 30 }} />, color: '#6366f1', route: '/parent-portal/meetings' },
              { title: 'Communication Hub', icon: <ForumIcon sx={{ fontSize: 30 }} />, color: '#3b82f6', route: '/parent-portal/messages' },
              { title: 'Transport Tracking', icon: <DirectionsBusIcon sx={{ fontSize: 30 }} />, color: '#10b981', route: '/parent-portal/transport' },
              { title: 'Complaints Desk', icon: <ReportProblemIcon sx={{ fontSize: 30 }} />, color: '#ef4444', route: '/parent-portal/complaints' },
              { title: 'Notice Board', icon: <CampaignIcon sx={{ fontSize: 30 }} />, color: '#14b8a6', route: '/parent-portal/notices' },
              { title: 'Timetable', icon: <CalendarMonthIcon sx={{ fontSize: 30 }} />, color: '#f97316', route: '/parent-portal/timetable' },
              { title: 'Portal Settings', icon: <SettingsIcon sx={{ fontSize: 30 }} />, color: '#64748b', route: '/parent-portal/settings' },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.08)', borderColor: item.color }
                  }}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    else if (item.route) navigate(item.route);
                  }}
                >
                  <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{item.title}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* QUICK LEAVE REQUEST MODAL (STUDENT DIRECT TO PRINCIPAL) */}
      <QuickLeaveRequestModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        defaultRole="STUDENT"
        applicantName={selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName} (by Parent: ${parentInfo?.firstName || 'Parent'})` : 'Student (by Parent)'}
      />

      {/* DIRECT PRINCIPAL QUERY MODAL */}
      <PrincipalQueryModal
        open={queryModalOpen}
        onClose={() => setQueryModalOpen(false)}
        senderRole="PARENT"
        senderName={parentInfo ? `${parentInfo.firstName} ${parentInfo.lastName}` : 'Parent User'}
      />
    </Box>
  );
};

export default ParentPortalDashboard;