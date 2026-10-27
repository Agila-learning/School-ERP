import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, MenuItem, Alert, Chip, IconButton, Tooltip, Grid, Card, CardContent, Avatar,
  InputAdornment, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, TableContainer
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HotelIcon from '@mui/icons-material/Hotel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { getHostels, getActiveStudentsForAttendance, markAttendance, getAttendance } from '../api/hostel.api';
import { publishNotification } from '../../../core/services/realtimeNotificationBus';

const HostelAttendance: React.FC = () => {
  const [hostels, setHostels] = useState<any[]>([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rollCallType, setRollCallType] = useState('NIGHT');
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: string }>({});
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostel) {
      loadStudents();
    }
  }, [selectedHostel, date, rollCallType]);

  const fetchHostels = async () => {
    try {
      const data = await getHostels();
      const list = Array.isArray(data) ? data : [];
      setHostels(list);
      if (list.length > 0 && !selectedHostel) {
        setSelectedHostel(list[0]._id);
      }
    } catch (e: any) {
      setError('Failed to fetch hostels list');
    }
  };

  const loadStudents = async () => {
    if (!selectedHostel) return;
    setLoading(true);
    try {
      const data = await getActiveStudentsForAttendance(selectedHostel);
      const studentList = Array.isArray(data) ? data : [];
      setStudents(studentList);
      
      // Load any existing attendance marked for this session
      const existing = await getAttendance(selectedHostel, date, rollCallType);
      const existingArray = Array.isArray(existing) ? existing : [];
      const newAtt: { [key: string]: string } = {};
      const newRem: { [key: string]: string } = {};
      
      studentList.forEach((alloc: any) => {
        const studentId = alloc.studentId?._id || alloc.studentId;
        const ex = existingArray.find((e: any) => (e.studentId?._id || e.studentId) === studentId);
        newAtt[studentId] = ex ? ex.status : 'PRESENT';
        newRem[studentId] = ex ? (ex.remarks || '') : '';
      });
      
      setAttendanceRecords(newAtt);
      setRemarks(newRem);
    } catch (e: any) {
      setError('Failed to load active hostellers for attendance');
    } finally {
      setLoading(false);
    }
  };

  // Mark all filtered as present
  const handleMarkAllPresent = () => {
    const updated = { ...attendanceRecords };
    students.forEach((alloc: any) => {
      const studentId = alloc.studentId?._id || alloc.studentId;
      updated[studentId] = 'PRESENT';
    });
    setAttendanceRecords(updated);
    setSuccess('All students marked as PRESENT in roster');
    setTimeout(() => setSuccess(''), 2500);
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleRemarkChange = (studentId: string, text: string) => {
    setRemarks(prev => ({
      ...prev,
      [studentId]: text
    }));
  };

  const handleSave = async () => {
    if (!selectedHostel || students.length === 0) return;
    setSaving(true);
    try {
      const records = students.map((s: any) => {
        const sId = s.studentId?._id || s.studentId;
        return {
          studentId: sId,
          allocationId: s._id,
          status: attendanceRecords[sId] || 'PRESENT',
          remarks: remarks[sId] || ''
        };
      });

      await markAttendance({
        hostelId: selectedHostel,
        date,
        rollCallType,
        records
      });
      
      setSuccess('Hostel roll call attendance saved successfully!');
      setTimeout(() => setSuccess(''), 3000);

      // Realtime notification to warden & admin
      publishNotification({
        id: `noti-${Date.now()}`,
        title: 'Hostel Roll Call Saved',
        message: `${rollCallType} roll call completed for ${records.length} hostellers.`,
        type: 'HOSTEL_RESIDENT',
        priority: 'MEDIUM',
        targetRole: 'HOSTEL_WARDEN',
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Dispatch emergency alert for absentees
  const handleDispatchSecurityAlert = () => {
    const absentees = students.filter(s => {
      const sId = s.studentId?._id || s.studentId;
      return attendanceRecords[sId] === 'ABSENT';
    });

    publishNotification({
      id: `noti-gate-${Date.now()}`,
      title: '🚨 NIGHT CURFEW ALERT: Unaccounted Absentees',
      message: `${absentees.length} resident hosteller(s) marked ABSENT during night curfew muster! Immediate gate verification requested.`,
      type: 'SECURITY_ALERT',
      priority: 'CRITICAL',
      targetRole: 'WATCHMAN',
      timestamp: new Date().toISOString()
    });

    setOpenAlertModal(false);
    setSuccess(`Security alert dispatched to Main Gate Security for ${absentees.length} absent students!`);
    setTimeout(() => setSuccess(''), 4000);
  };

  // KPIs
  const stats = useMemo(() => {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let outpass = 0;
    let medical = 0;
    let leave = 0;

    students.forEach(s => {
      const sId = s.studentId?._id || s.studentId;
      const st = attendanceRecords[sId] || 'PRESENT';
      if (st === 'PRESENT') present++;
      else if (st === 'ABSENT') absent++;
      else if (st === 'OUTPASS') outpass++;
      else if (st === 'MEDICAL') medical++;
      else if (st === 'LEAVE' || st === 'ON_LEAVE') leave++;
    });

    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, outpass, medical, leave, percent };
  }, [students, attendanceRecords]);

  // Filtered roster
  const filteredStudents = useMemo(() => {
    return students.filter(alloc => {
      const s = alloc.studentId;
      const sId = s?._id || s;
      const name = `${s?.firstName || ''} ${s?.lastName || ''}`.toLowerCase();
      const adm = (s?.admissionNumber || s?.studentId || '').toLowerCase();
      const rNum = (alloc.roomId?.roomNumber || '').toLowerCase();
      const bNum = (alloc.bedId?.bedNumber || '').toLowerCase();
      const st = attendanceRecords[sId] || 'PRESENT';

      const matchesSearch = !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        adm.includes(searchQuery.toLowerCase()) ||
        rNum.includes(searchQuery.toLowerCase()) ||
        bNum.includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || st === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter, attendanceRecords]);

  const absentStudentsList = useMemo(() => {
    return students.filter(s => {
      const sId = s.studentId?._id || s.studentId;
      return attendanceRecords[sId] === 'ABSENT';
    });
  }, [students, attendanceRecords]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: '#4f46e5', width: 44, height: 44, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}>
            <EventAvailableIcon sx={{ fontSize: 26, color: '#ffffff' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Hostel Roll Call & Curfew Muster Desk
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Real-time daily attendance, evening curfew compliance, gate leave sync and security sweep alerts
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {stats.absent > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<SecurityIcon />}
              onClick={() => setOpenAlertModal(true)}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Alert Gate ({stats.absent} Absentees)
            </Button>
          )}

          <Button
            variant="outlined"
            color="success"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllPresent}
            disabled={students.length === 0}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Mark All Present
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!selectedHostel || students.length === 0 || saving}
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              borderRadius: 2
            }}
          >
            {saving ? 'Saving...' : 'Save Roll Call'}
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Enrolled Hostellers
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                {stats.total}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Active in Hostel
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                Present in Rooms
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                {stats.present}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                {stats.percent}% Roll Call Verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${stats.absent > 0 ? '#fecaca' : '#e2e8f0'}`, bgcolor: stats.absent > 0 ? '#fff5f5' : '#ffffff' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                Unaccounted Absentees
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                {stats.absent}
              </Typography>
              <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                {stats.absent > 0 ? 'Requires Security Check' : 'Zero Absentees'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                On Approved Outpass
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.5 }}>
                {stats.outpass}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0284c7' }}>
                Gate Clearance Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                Sick Bay / Medical
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ea580c', mt: 0.5 }}>
                {stats.medical}
              </Typography>
              <Typography variant="caption" sx={{ color: '#ea580c' }}>
                Under Campus Clinic Care
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Shift Session Bar */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="hostel-muster-label">Hostel Residency</InputLabel>
              <Select
                labelId="hostel-muster-label"
                label="Hostel Residency"
                value={selectedHostel}
                onChange={e => setSelectedHostel(e.target.value)}
                sx={{ bgcolor: '#ffffff' }}
              >
                {hostels.map(h => (
                  <MenuItem key={h._id} value={h._id}>
                    {h.name} ({h.hostelType})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <TextField 
              label="Muster Date" 
              type="date" 
              size="small"
              value={date} 
              onChange={e => setDate(e.target.value)} 
              fullWidth 
              sx={{ bgcolor: '#ffffff' }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="session-muster-label">Roll Call Session</InputLabel>
              <Select
                labelId="session-muster-label"
                label="Roll Call Session"
                value={rollCallType}
                onChange={e => setRollCallType(e.target.value)}
                sx={{ bgcolor: '#ffffff' }}
              >
                <MenuItem value="NIGHT">🌙 Night Curfew Roll Call (8:30 PM - 9:30 PM)</MenuItem>
                <MenuItem value="MORNING">☀️ Morning Muster Roll (6:30 AM - 7:30 AM)</MenuItem>
                <MenuItem value="EVENING">🌆 Evening Study Roll Call (5:00 PM - 6:00 PM)</MenuItem>
                <MenuItem value="CUSTOM">📋 Special Emergency Roll Call</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search student, room #, bed #..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: '#ffffff' }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Main Roster Table */}
      {selectedHostel && students.length > 0 ? (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Muster Roll Roster ({filteredStudents.length} Students)
            </Typography>
            <Stack direction="row" spacing={1}>
              {['ALL', 'PRESENT', 'ABSENT', 'OUTPASS', 'MEDICAL'].map(st => (
                <Chip
                  key={st}
                  size="small"
                  label={st}
                  onClick={() => setStatusFilter(st)}
                  color={statusFilter === st ? 'primary' : 'default'}
                  variant={statusFilter === st ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Student Resident</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Room & Bed</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Muster Attendance Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Warden Remarks</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Contact</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map(alloc => {
                  const s = alloc.studentId;
                  const sId = s?._id || s;
                  const currentStatus = attendanceRecords[sId] || 'PRESENT';

                  return (
                    <TableRow 
                      key={alloc._id} 
                      hover
                      sx={{ 
                        bgcolor: currentStatus === 'ABSENT' ? '#fff1f2' : currentStatus === 'OUTPASS' ? '#f0f9ff' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ 
                            bgcolor: currentStatus === 'PRESENT' ? '#16a34a' : currentStatus === 'ABSENT' ? '#dc2626' : '#7c3aed',
                            width: 36, 
                            height: 36, 
                            fontWeight: 700 
                          }}>
                            {s?.firstName?.[0] || 'S'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {s?.firstName} {s?.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              Admission ID: {s?.admissionNumber || s?.studentId || 'N/A'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            size="small" 
                            label={`Room ${alloc.roomId?.roomNumber || 'N/A'}`} 
                            sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} 
                          />
                          <Chip 
                            size="small" 
                            label={`Bed ${alloc.bedId?.bedNumber || 'N/A'}`} 
                            sx={{ fontWeight: 700, bgcolor: '#ede9fe', color: '#7c3aed' }} 
                          />
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap">
                          {[
                            { key: 'PRESENT', label: 'Present', color: '#16a34a', bg: '#dcfce7' },
                            { key: 'ABSENT', label: 'Absent', color: '#dc2626', bg: '#fee2e2' },
                            { key: 'OUTPASS', label: 'Outpass', color: '#0284c7', bg: '#e0f2fe' },
                            { key: 'MEDICAL', label: 'Sick Bay', color: '#ea580c', bg: '#ffedd5' },
                            { key: 'LEAVE', label: 'On Leave', color: '#7c3aed', bg: '#f3e8ff' }
                          ].map(btn => {
                            const isSelected = currentStatus === btn.key;
                            return (
                              <Chip
                                key={btn.key}
                                size="small"
                                label={btn.label}
                                onClick={() => handleStatusChange(sId, btn.key)}
                                sx={{
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  bgcolor: isSelected ? btn.color : '#f1f5f9',
                                  color: isSelected ? '#ffffff' : '#475569',
                                  border: `1px solid ${isSelected ? btn.color : '#cbd5e1'}`,
                                  transition: 'all 0.15s',
                                  '&:hover': {
                                    bgcolor: isSelected ? btn.color : btn.bg,
                                    borderColor: btn.color
                                  }
                                }}
                              />
                            );
                          })}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Optional notes / reason..."
                          value={remarks[sId] || ''}
                          onChange={e => handleRemarkChange(sId, e.target.value)}
                          sx={{ width: 220, bgcolor: '#ffffff' }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        {s?.phone ? (
                          <Tooltip title={`Call Guardian: ${s.phone}`}>
                            <IconButton 
                              size="small" 
                              component="a" 
                              href={`tel:${s.phone}`}
                              sx={{ color: '#0284c7', bgcolor: '#e0f2fe' }}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>No Phone</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
                      No students found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : selectedHostel ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
          <HotelIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>No Active Residents Allocated</Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>Go to Bed Allocations to allocate students to this hostel first.</Typography>
        </Paper>
      ) : (
        <Alert severity="info">Please select a hostel to conduct roll call attendance.</Alert>
      )}

      {/* --- EMERGENCY SECURITY GATE ALERT MODAL --- */}
      <Dialog open={openAlertModal} onClose={() => setOpenAlertModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626', borderBottom: '1px solid #fee2e2', bgcolor: '#fff5f5' }}>
          🚨 Dispatch Night Curfew Security Alert
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              The following {absentStudentsList.length} student(s) are unaccounted for during the {rollCallType} muster. This will trigger an immediate emergency alert at the Main Security Gate.
            </Alert>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Absent Hostellers:
            </Typography>

            <Paper sx={{ maxHeight: 200, overflowY: 'auto', p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              {absentStudentsList.map(a => (
                <Box key={a._id} sx={{ py: 1, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {a.studentId?.firstName} {a.studentId?.lastName} ({a.studentId?.admissionNumber})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700 }}>
                    Room {a.roomId?.roomNumber || 'N/A'} • Bed {a.bedId?.bedNumber || 'N/A'}
                  </Typography>
                </Box>
              ))}
            </Paper>

            <Typography variant="caption" sx={{ color: '#64748b' }}>
              • Security guards at Campus Gates A & B will be notified to verify perimeter logs.
              <br />
              • Parents will receive an automated absence notification via SMS and Parent Portal.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenAlertModal(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<SecurityIcon />}
            onClick={handleDispatchSecurityAlert}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Dispatch Security Gate Alert
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default HostelAttendance;
