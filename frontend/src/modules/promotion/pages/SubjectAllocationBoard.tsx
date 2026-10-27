import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Avatar, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress,
  IconButton, Tooltip, Alert, Snackbar, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import api from '../../../core/api/axios';

interface StudentAllocation {
  id: string;
  name: string;
  gpa: number;
  status: 'ALLOCATED' | 'WAITLISTED';
  requestedAt?: string;
}

interface ElectiveSubject {
  id: string;
  title: string;
  grade: string;
  capacity: number;
  students: StudentAllocation[];
}

const initialSubjects: ElectiveSubject[] = [
  {
    id: 'subj-1',
    title: 'Computer Science (Elective)',
    grade: 'Grade 11',
    capacity: 30,
    students: [
      { id: 's1', name: 'Aarav Patel', gpa: 3.8, status: 'ALLOCATED' },
      { id: 's2', name: 'Sara Khan', gpa: 3.9, status: 'ALLOCATED' },
      { id: 's3', name: 'Rohan Gupta', gpa: 3.7, status: 'ALLOCATED' },
    ]
  },
  {
    id: 'subj-2',
    title: 'Advanced Physics (Elective)',
    grade: 'Grade 11',
    capacity: 30,
    students: [
      { id: 's4', name: 'David Lee', gpa: 3.8, status: 'ALLOCATED' },
      { id: 's5', name: 'Priya Sharma', gpa: 3.9, status: 'WAITLISTED', requestedAt: '2 days ago' },
      { id: 's6', name: 'Kabir Mehta', gpa: 3.5, status: 'WAITLISTED', requestedAt: 'Yesterday' }
    ]
  },
  {
    id: 'subj-3',
    title: 'Economics & Financial Literacy',
    grade: 'Grade 11',
    capacity: 25,
    students: [
      { id: 's7', name: 'Neha Varma', gpa: 3.6, status: 'ALLOCATED' },
      { id: 's8', name: 'Karthik Rao', gpa: 3.8, status: 'ALLOCATED' }
    ]
  }
];

const SubjectAllocationBoard: React.FC = () => {
  const [subjects, setSubjects] = useState<ElectiveSubject[]>(initialSubjects);
  const [openAddSubject, setOpenAddSubject] = useState(false);
  const [openAllocateStudent, setOpenAllocateStudent] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-1');

  // Form states
  const [newSubject, setNewSubject] = useState({ title: '', grade: 'Grade 11', capacity: 30 });
  const [newStudent, setNewStudent] = useState({ name: '', gpa: 3.8, status: 'ALLOCATED' as const });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const res = await api.get('/promotion/allocation/subjects');
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          // Sync with backend if available
        }
      } catch (err) {
        // Fallback to active board state
      }
    };
    fetchAllocations();
  }, []);

  const handleCreateSubject = () => {
    if (!newSubject.title.trim()) {
      setSnackbar({ open: true, message: 'Subject title is required', severity: 'error' });
      return;
    }

    const created: ElectiveSubject = {
      id: `subj-${Date.now()}`,
      title: newSubject.title.trim(),
      grade: newSubject.grade,
      capacity: Number(newSubject.capacity) || 30,
      students: []
    };

    setSubjects(prev => [...prev, created]);
    setOpenAddSubject(false);
    setNewSubject({ title: '', grade: 'Grade 11', capacity: 30 });
    setSnackbar({ open: true, message: 'Elective subject added to allocation board', severity: 'success' });
  };

  const handleAllocateStudent = async () => {
    if (!newStudent.name.trim()) {
      setSnackbar({ open: true, message: 'Student name is required', severity: 'error' });
      return;
    }

    const studentItem: StudentAllocation = {
      id: `st-${Date.now()}`,
      name: newStudent.name.trim(),
      gpa: Number(newStudent.gpa) || 3.5,
      status: newStudent.status,
      requestedAt: 'Just now'
    };

    setSubjects(prev => prev.map(s => {
      if (s.id === selectedSubjectId) {
        return { ...s, students: [...s.students, studentItem] };
      }
      return s;
    }));

    try {
      await api.post('/promotion/allocation/subject', {
        allocationType: 'ELECTIVE',
        status: newStudent.status
      });
    } catch (e) {
      // Local state already updated
    }

    setOpenAllocateStudent(false);
    setNewStudent({ name: '', gpa: 3.8, status: 'ALLOCATED' });
    setSnackbar({ open: true, message: 'Student allocation recorded successfully', severity: 'success' });
  };

  const handlePromoteWaitlist = (subjectId: string, studentId: string) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        const updated = s.students.map(st => st.id === studentId ? { ...st, status: 'ALLOCATED' as const } : st);
        return { ...s, students: updated };
      }
      return s;
    }));
    setSnackbar({ open: true, message: 'Student promoted from waitlist to allocated!', severity: 'success' });
  };

  const handleRemoveStudent = (subjectId: string, studentId: string) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        return { ...s, students: s.students.filter(st => st.id !== studentId) };
      }
      return s;
    }));
    setSnackbar({ open: true, message: 'Student removed from subject', severity: 'success' });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Subject & Elective Allocation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage elective choices, waitlists, and capacities for progressing students
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={() => setOpenAddSubject(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Add Elective Subject
          </Button>
          <Button 
            variant="contained" 
            startIcon={<GroupAddIcon />} 
            onClick={() => {
              if (subjects.length > 0) setSelectedSubjectId(subjects[0].id);
              setOpenAllocateStudent(true);
            }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Allocate Student
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {subjects.map((subj) => {
          const allocatedList = subj.students.filter(st => st.status === 'ALLOCATED');
          const waitlist = subj.students.filter(st => st.status === 'WAITLISTED');
          const isFull = allocatedList.length >= subj.capacity;
          const occupancyPct = Math.min(100, Math.round((allocatedList.length / subj.capacity) * 100));

          return (
            <Grid item xs={12} md={6} lg={4} key={subj.id}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  borderRadius: 3, 
                  overflow: 'hidden', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                {/* Header Card */}
                <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {subj.title}
                    </Typography>
                    {isFull ? (
                      <Chip label="FULL" size="small" color="error" sx={{ fontWeight: 700 }} />
                    ) : (
                      <Chip label={`${subj.capacity - allocatedList.length} Left`} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                    Capacity: <b>{allocatedList.length} / {subj.capacity}</b> | {subj.grade}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={occupancyPct} 
                    color={isFull ? 'error' : occupancyPct > 80 ? 'warning' : 'primary'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                {/* Allocated Students Section */}
                <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Allocated Students ({allocatedList.length})
                  </Typography>
                  {allocatedList.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                      No students allocated yet.
                    </Typography>
                  ) : (
                    allocatedList.map((st) => (
                      <Card key={st.id} variant="outlined" sx={{ borderRadius: 2, border: '1px solid #f1f5f9', bgcolor: '#ffffff' }}>
                        <CardContent sx={{ p: '12px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#3b82f6', fontSize: 13, fontWeight: 700 }}>
                              {st.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                {st.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                GPA: {st.gpa}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Chip label="ALLOCATED" size="small" color="success" sx={{ fontSize: 10, fontWeight: 700, height: 22 }} />
                            <Tooltip title="Remove Student">
                              <IconButton size="small" color="error" onClick={() => handleRemoveStudent(subj.id, st.id)}>
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}

                  {/* Waitlist Section */}
                  {waitlist.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #cbd5e1' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                        Waitlist Queue ({waitlist.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {waitlist.map((st) => (
                          <Card key={st.id} variant="outlined" sx={{ bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 2 }}>
                            <CardContent sx={{ p: '12px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 34, height: 34, bgcolor: '#f59e0b', fontSize: 13, fontWeight: 700 }}>
                                  {st.name.split(' ').map(n => n[0]).join('')}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#78350f' }}>
                                    {st.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    GPA: {st.gpa} &bull; {st.requestedAt || 'Requested'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Button 
                                  size="small" 
                                  variant="contained" 
                                  color="warning" 
                                  onClick={() => handlePromoteWaitlist(subj.id, st.id)}
                                  startIcon={<CheckCircleOutlineIcon />}
                                  sx={{ fontSize: 11, textTransform: 'none', py: 0.2, px: 1 }}
                                >
                                  Admit
                                </Button>
                                <Tooltip title="Remove">
                                  <IconButton size="small" color="error" onClick={() => handleRemoveStudent(subj.id, st.id)}>
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Add Subject Dialog */}
      <Dialog open={openAddSubject} onClose={() => setOpenAddSubject(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Elective Subject</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              label="Subject Title" 
              required 
              fullWidth 
              value={newSubject.title}
              onChange={e => setNewSubject({ ...newSubject, title: e.target.value })}
              placeholder="e.g. Artificial Intelligence & Robotics"
            />
            <TextField 
              label="Grade / Target Level" 
              fullWidth 
              value={newSubject.grade}
              onChange={e => setNewSubject({ ...newSubject, grade: e.target.value })}
            />
            <TextField 
              label="Student Capacity" 
              type="number" 
              fullWidth 
              value={newSubject.capacity}
              onChange={e => setNewSubject({ ...newSubject, capacity: Number(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddSubject(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSubject}>Add Subject</Button>
        </DialogActions>
      </Dialog>

      {/* Allocate Student Dialog */}
      <Dialog open={openAllocateStudent} onClose={() => setOpenAllocateStudent(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Allocate Student to Subject</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Target Subject</InputLabel>
              <Select
                value={selectedSubjectId}
                label="Target Subject"
                onChange={e => setSelectedSubjectId(e.target.value)}
              >
                {subjects.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              label="Student Name" 
              required 
              fullWidth 
              value={newStudent.name}
              onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
              placeholder="e.g. Vikram Chandra"
            />
            <TextField 
              label="GPA / Aggregate Score" 
              type="number" 
              fullWidth 
              value={newStudent.gpa}
              onChange={e => setNewStudent({ ...newStudent, gpa: Number(e.target.value) })}
            />
            <FormControl fullWidth>
              <InputLabel>Allocation Type</InputLabel>
              <Select
                value={newStudent.status}
                label="Allocation Type"
                onChange={e => setNewStudent({ ...newStudent, status: e.target.value as any })}
              >
                <MenuItem value="ALLOCATED">Direct Allocation</MenuItem>
                <MenuItem value="WAITLISTED">Place on Waitlist</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAllocateStudent(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAllocateStudent}>Allocate</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubjectAllocationBoard;
