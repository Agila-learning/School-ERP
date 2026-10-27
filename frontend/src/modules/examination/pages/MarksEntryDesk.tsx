import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, CircularProgress, Alert, TextField, MenuItem, Chip,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SaveIcon from '@mui/icons-material/Save';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  getExams, getExamSchedules, getMarksEntries, saveMarksEntries, lockMarksSheet
} from '../api/examination.api';
import { getClasses, getSections } from '../../academic/api/academic.api';
import type { ClassSummary, SectionSummary } from '../../academic/api/academic.api';

const MarksEntryDesk: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [sheetId, setSheetId] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, number | ''>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmLockOpen, setConfirmLockOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getExams(), getClasses()]).then(([exData, clsData]) => {
      setExams(exData);
      setClasses(clsData);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getSections(selectedClass).then(setSections).catch(console.error);
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedExam) {
      getExamSchedules(selectedExam).then(setSchedules).catch(console.error);
    } else {
      setSchedules([]);
      setSelectedSubject('');
    }
  }, [selectedExam]);

  const uniqueSubjects = Array.from(
    new Map(schedules.map(s => [s.subjectId?._id || s.subjectId, s])).values()
  );

  const loadSheet = useCallback(async () => {
    if (!selectedExam || !selectedClass || !selectedSection || !selectedSubject) return;
    setLoadingSheet(true);
    setError(null);
    setEntries([]);
    setSheetId(null);
    try {
      const { entries: ents, config: cfg } = await getMarksEntries(selectedExam, selectedSubject, selectedSection, selectedClass);
      const newMap: Record<string, number | ''> = {};
      ents.forEach((e: any) => {
        const id = e.studentId?._id || e.studentId || e._id;
        newMap[id] = e.marksObtained ?? '';
      });
      setEntries(ents);
      setMarksMap(newMap);
      setConfig(cfg);
      if (ents.length > 0) {
        const sid = ents[0].marksSheetId;
        setSheetId(sid || null);
        setIsLocked(!!(ents[0].isLocked || ents[0].status === 'LOCKED'));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load marks sheet');
    } finally {
      setLoadingSheet(false);
    }
  }, [selectedExam, selectedClass, selectedSection, selectedSubject]);

  const handleSave = async () => {
    if (!sheetId) { setError('No marks sheet loaded'); return; }
    setSaving(true);
    setError(null);
    try {
      const marksData = entries.map((e: any) => {
        const id = e.studentId?._id || e.studentId || e._id;
        return { studentId: id, marksObtained: marksMap[id] ?? 0 };
      });
      await saveMarksEntries(sheetId, marksData);
      setSuccessMsg('Marks saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handleClearMarks = () => {
    const cleared: Record<string, number | ''> = {};
    entries.forEach((e: any) => {
      const id = e.studentId?._id || e.studentId || e._id;
      cleared[id] = '';
    });
    setMarksMap(cleared);
    setConfirmClearOpen(false);
    setSuccessMsg('Marks cleared. Click Save to persist.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleLock = async () => {
    if (!sheetId) return;
    setSaving(true);
    try {
      await lockMarksSheet(sheetId);
      setIsLocked(true);
      setConfirmLockOpen(false);
      setSuccessMsg('Marks sheet locked successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to lock marks sheet');
    } finally {
      setSaving(false);
    }
  };

  const enteredCount = Object.values(marksMap).filter(v => v !== '').length;
  const totalStudents = entries.length;
  const progress = totalStudents > 0 ? (enteredCount / totalStudents) * 100 : 0;
  const maxMarks = config?.maxMarks || 100;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%)', borderRadius: 3, p: 4, mb: 4, color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Marks Entry Desk</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>Enter, edit, clear, and lock exam marks for your class</Typography>
          </Box>
          <AssignmentIcon sx={{ fontSize: 52, opacity: 0.3 }} />
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 2 }}>{successMsg}</Alert>}

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2 }}>Select Exam Parameters</Typography>
        {loading ? <CircularProgress size={24} /> : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <TextField select label="Examination" size="small" fullWidth value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
              {exams.map(ex => <MenuItem key={ex.id || ex._id} value={ex.id || ex._id}>{ex.name}</MenuItem>)}
            </TextField>
            <TextField select label="Class" size="small" fullWidth value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select label="Section" size="small" fullWidth value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
              {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField select label="Subject" size="small" fullWidth value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              {uniqueSubjects.map(s => (
                <MenuItem key={s.subjectId?._id || s.subjectId} value={s.subjectId?._id || s.subjectId}>{s.subjectId?.name || 'Subject'}</MenuItem>
              ))}
            </TextField>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={loadSheet} disabled={!selectedExam || !selectedClass || !selectedSection || !selectedSubject || loadingSheet} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            {loadingSheet ? 'Loading...' : 'Load Marks Sheet'}
          </Button>
        </Box>
      </Paper>

      {/* Sheet */}
      {entries.length > 0 && (
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          {/* Sheet Header */}
          <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#1e293b' }}>
                Marks Entry — {enteredCount}/{totalStudents} students filled
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                <Box sx={{ width: 200, height: 6, bgcolor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: progress === 100 ? '#10b981' : '#6366f1', borderRadius: 3, transition: 'width 0.3s' }} />
                </Box>
                <Typography variant="caption" color="text.secondary">{Math.round(progress)}%</Typography>
                {isLocked && <Chip label="LOCKED" size="small" color="success" icon={<LockIcon />} />}
                <Typography variant="caption" color="text.secondary">Max: {maxMarks} marks</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isLocked && (
                <>
                  <Tooltip title="Clear all marks">
                    <Button variant="outlined" color="error" size="small" startIcon={<DeleteSweepIcon />} onClick={() => setConfirmClearOpen(true)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                      Clear All
                    </Button>
                  </Tooltip>
                  <Button variant="contained" color="primary" size="small" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                    {saving ? 'Saving...' : 'Save Marks'}
                  </Button>
                  <Tooltip title="Lock this sheet to prevent further edits">
                    <Button variant="contained" color="warning" size="small" startIcon={<LockIcon />} onClick={() => setConfirmLockOpen(true)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, color: 'white' }}>
                      Lock Sheet
                    </Button>
                  </Tooltip>
                </>
              )}
              {isLocked && (
                <Chip label="Sheet Locked — Read Only" color="success" icon={<CheckCircleIcon />} variant="outlined" />
              )}
            </Box>
          </Box>

          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', width: 50 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Roll No.</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', width: 180 }}>Marks (out of {maxMarks})</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Grade</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry: any, idx: number) => {
                const studentId = entry.studentId?._id || entry.studentId || entry._id;
                const marks = marksMap[studentId];
                const pct = typeof marks === 'number' ? (marks / maxMarks) * 100 : null;
                const grade = pct === null ? '—' : pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
                const gradeColor = pct === null ? 'default' : pct >= 80 ? 'success' : pct >= 60 ? 'primary' : pct >= 40 ? 'warning' : 'error';
                return (
                  <TableRow key={studentId} hover>
                    <TableCell sx={{ color: '#94a3b8' }}>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{entry.studentId?.firstName} {entry.studentId?.lastName}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', fontFamily: 'monospace' }}>{entry.studentId?.rollNumber || entry.rollNumber || '-'}</TableCell>
                    <TableCell>
                      {isLocked ? (
                        <Typography sx={{ fontWeight: 700, color: pct !== null && pct < 40 ? 'error.main' : 'text.primary' }}>
                          {marks !== '' && marks !== undefined ? marks : '—'}
                        </Typography>
                      ) : (
                        <TextField
                          size="small"
                          type="number"
                          variant="outlined"
                          value={marks}
                          placeholder={`0-${maxMarks}`}
                          slotProps={{ htmlInput: { min: 0, max: maxMarks, style: { width: 80, textAlign: 'center', fontWeight: 600 } } }}
                          onChange={e => {
                            const val = e.target.value === '' ? '' : Math.min(maxMarks, Math.max(0, Number(e.target.value)));
                            setMarksMap(prev => ({ ...prev, [studentId]: val }));
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          error={typeof marks === 'number' && marks < 0}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={grade} size="small" color={gradeColor as any} variant={pct === null ? 'outlined' : 'filled'} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={marks !== '' && marks !== undefined ? 'Entered' : 'Pending'}
                        size="small"
                        color={marks !== '' && marks !== undefined ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Confirm Clear Dialog */}
      <Dialog open={confirmClearOpen} onClose={() => setConfirmClearOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Clear All Marks?</DialogTitle>
        <DialogContent>
          <Typography>This will reset all entered marks for this sheet. You will need to save again to persist the change.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmClearOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleClearMarks}>Yes, Clear All</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Lock Dialog */}
      <Dialog open={confirmLockOpen} onClose={() => setConfirmLockOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Lock Marks Sheet?</DialogTitle>
        <DialogContent>
          <Typography>Once locked, no further edits can be made to this marks sheet. This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmLockOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleLock} disabled={saving} sx={{ color: 'white' }}>
            {saving ? 'Locking...' : 'Yes, Lock Sheet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarksEntryDesk;
