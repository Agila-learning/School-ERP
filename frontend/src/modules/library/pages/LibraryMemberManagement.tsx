// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Avatar, Stack, FormControl, InputLabel, Select,
  Grid
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { getLibraryMembers } from '../api/library.api';
import { getClasses, getSections } from '../../academic/api/academic.api';
import { getStudents } from '../../students/api/student.api';
import type { ClassSummary, SectionSummary } from '../../academic/api/academic.api';
import type { StudentSummary } from '../../students/api/student.api';
import axios from '../../../core/api/axios';

const statusColors: Record<string, any> = {
  ACTIVE: 'success', SUSPENDED: 'warning', BLOCKED: 'error', EXPIRED: 'default', CANCELLED: 'default'
};

const LibraryMemberManagement: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');

  // Classes & Sections for student sync
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [dialogStudents, setDialogStudents] = useState<StudentSummary[]>([]);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogClass, setDialogClass] = useState('');
  const [dialogSection, setDialogSection] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [form, setForm] = useState<any>({
    memberType: 'STUDENT',
    maxBooksAllowed: 3,
    issueDurationDays: 14,
    renewalLimit: 2,
    reservationLimit: 2,
    finePerDay: 2,
    gracePeriodDays: 2
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load classes
  useEffect(() => {
    getClasses().then(c => setClasses(c || [])).catch(() => {});
  }, []);

  const fetchMembers = () => {
    const params: any = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.memberType = filterType;
    setLoading(true);
    getLibraryMembers(params)
      .then(data => setMembers(data || []))
      .catch(() => setError('Failed to load library members.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchMembers(); 
  }, [filterStatus, filterType]);

  // Load sections when dialog class changes
  useEffect(() => {
    if (dialogClass) {
      getSections(dialogClass).then(s => setSections(s || [])).catch(() => setSections([]));
    } else {
      setSections([]);
    }
    setDialogSection('');
    setSelectedStudentId('');
  }, [dialogClass]);

  // Load students for dialog based on chosen Class & Section
  useEffect(() => {
    if (form.memberType === 'STUDENT' && dialogClass) {
      setLoadingStudents(true);
      const params: any = { classId: dialogClass };
      if (dialogSection) params.sectionId = dialogSection;
      getStudents(params)
        .then(res => setDialogStudents(res || []))
        .catch(() => setDialogStudents([]))
        .finally(() => setLoadingStudents(false));
    } else {
      setDialogStudents([]);
    }
  }, [dialogClass, dialogSection, form.memberType]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    const chosen = dialogStudents.find(s => s.id === studentId || (s as any)._id === studentId);
    if (chosen) {
      setForm((prev: any) => ({
        ...prev,
        userId: (chosen as any).userId || chosen.id || (chosen as any)._id,
        studentName: `${chosen.firstName} ${chosen.lastName}`,
        studentIdNumber: chosen.studentIdNumber
      }));
    }
  };

  const handleRegister = async () => {
    setSaving(true);
    try {
      await axios.post('/v1/library/members', form);
      setOpenDialog(false);
      fetchMembers();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to register member.');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (membershipId: string, status: string) => {
    try {
      await axios.patch(`/v1/library/members/${membershipId}/status`, { status });
      fetchMembers();
    } catch { setError('Failed to update status.'); }
  };

  const filteredMembers = members.filter(m => {
    if (filterClass !== 'ALL') {
      const cls = m.classId?.name || m.class || '';
      return cls.includes(filterClass);
    }
    return true;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Library Members</Typography>
          <Typography variant="body2" color="text.secondary">
            Synchronized patrons, borrowing quotas & membership lifecycle across classes
          </Typography>
        </div>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />} 
          onClick={() => {
            setDialogClass('');
            setDialogSection('');
            setSelectedStudentId('');
            setOpenDialog(true);
          }}
          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
        >
          Register Member
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <TextField select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All Statuses</MenuItem>
          {['ACTIVE', 'SUSPENDED', 'BLOCKED', 'EXPIRED', 'CANCELLED'].map(s => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        
        <TextField select label="Member Type" value={filterType} onChange={e => setFilterType(e.target.value)} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All Types</MenuItem>
          {['STUDENT', 'TEACHER', 'STAFF', 'GUEST'].map(t => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>

        <TextField select label="Class Roster" value={filterClass} onChange={e => setFilterClass(e.target.value)} size="small" sx={{ minWidth: 160 }}>
          <MenuItem value="ALL">All Classes</MenuItem>
          {classes.map(c => (
            <MenuItem key={c.id || (c as any)._id} value={c.name}>{c.name}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Member Scholar / Staff</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Membership No.</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Library</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Books Quota</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No library members found for selected criteria.</TableCell></TableRow>
              ) : filteredMembers.map((m: any) => (
                <TableRow key={m._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 700, fontSize: '0.85rem' }}>
                        {m.userId?.firstName?.[0] || 'M'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {m.userId?.firstName} {m.userId?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {m.studentIdNumber || m.userId?.email || 'Patron Account'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell><code style={{ fontWeight: 700, color: '#4338ca' }}>{m.membershipNumber || 'LIB-MEM'}</code></TableCell>
                  <TableCell><Chip label={m.memberType} size="small" variant="outlined" /></TableCell>
                  <TableCell>{m.libraryId?.name || 'Main Campus Library'}</TableCell>
                  <TableCell><strong>{m.maxBooksAllowed}</strong> books</TableCell>
                  <TableCell>
                    <Chip label={m.status} color={statusColors[m.status] || 'default'} size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    {m.status === 'ACTIVE' && (
                      <Button size="small" color="warning" onClick={() => handleStatusChange(m._id, 'SUSPENDED')}>Suspend</Button>
                    )}
                    {m.status === 'SUSPENDED' && (
                      <Button size="small" color="success" onClick={() => handleStatusChange(m._id, 'ACTIVE')}>Activate</Button>
                    )}
                    {m.status !== 'CANCELLED' && (
                      <Button size="small" color="error" onClick={() => handleStatusChange(m._id, 'BLOCKED')}>Block</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Synchronized Register Member Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Register Library Member</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField 
              select 
              label="Member Type" 
              value={form.memberType} 
              onChange={e => setForm({ ...form, memberType: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['STUDENT', 'TEACHER', 'STAFF', 'GUEST'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>

            {/* If Member is STUDENT: Pick from real synchronized database students by Class & Section */}
            {form.memberType === 'STUDENT' ? (
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Select Enrolled Student Scholar
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filter Class</InputLabel>
                      <Select
                        value={dialogClass}
                        label="Filter Class"
                        onChange={(e) => setDialogClass(e.target.value)}
                      >
                        <MenuItem value="">Choose Class...</MenuItem>
                        {classes.map(c => (
                          <MenuItem key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" disabled={!dialogClass}>
                      <InputLabel>Section</InputLabel>
                      <Select
                        value={dialogSection}
                        label="Section"
                        onChange={(e) => setDialogSection(e.target.value)}
                      >
                        <MenuItem value="">All Sections</MenuItem>
                        {sections.map(s => (
                          <MenuItem key={s.id || (s as any)._id} value={s.id || (s as any)._id}>
                            Section {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <FormControl fullWidth size="small" disabled={!dialogClass || loadingStudents}>
                  <InputLabel>Select Student</InputLabel>
                  <Select
                    value={selectedStudentId}
                    label="Select Student"
                    onChange={(e) => handleStudentSelect(e.target.value)}
                  >
                    {loadingStudents ? (
                      <MenuItem value="" disabled>Loading scholars...</MenuItem>
                    ) : dialogStudents.length === 0 ? (
                      <MenuItem value="" disabled>No students enrolled in this class/section</MenuItem>
                    ) : (
                      dialogStudents.map(s => (
                        <MenuItem key={s.id || (s as any)._id} value={s.id || (s as any)._id}>
                          {s.firstName} {s.lastName} ({s.studentIdNumber || s.id})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <TextField 
                label="Staff / User ID or Name" 
                value={form.userId || ''} 
                onChange={e => setForm({ ...form, userId: e.target.value })} 
                fullWidth 
                size="small" 
                helperText="Enter the staff employee record ID or name" 
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Max Books Allowed" type="number" value={form.maxBooksAllowed} onChange={e => setForm({ ...form, maxBooksAllowed: +e.target.value })} fullWidth size="small" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Issue Duration (days)" type="number" value={form.issueDurationDays} onChange={e => setForm({ ...form, issueDurationDays: +e.target.value })} fullWidth size="small" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Renewal Limit" type="number" value={form.renewalLimit} onChange={e => setForm({ ...form, renewalLimit: +e.target.value })} fullWidth size="small" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Fine Per Day (₹)" type="number" value={form.finePerDay} onChange={e => setForm({ ...form, finePerDay: +e.target.value })} fullWidth size="small" />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRegister} disabled={saving || (!form.userId && !selectedStudentId)}>
            {saving ? 'Registering...' : 'Register Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LibraryMemberManagement;
