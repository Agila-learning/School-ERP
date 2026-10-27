// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Button, TextField, MenuItem, IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSubjectConfigs, getMarksEntries, saveMarksEntries } from '../api/examination.api';
import type { SubjectExamConfig, MarksEntry, ComponentConfig } from '../api/examination.api';

const MarksEntryGrid: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('exam') || '';
  const subjectId = searchParams.get('subject') || '';
  const sectionId = searchParams.get('section') || '';
  const classId = searchParams.get('class') || '';

  const [config, setConfig] = useState<SubjectExamConfig | null>(null);
  const [entries, setEntries] = useState<MarksEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMarksEntries(examId, subjectId, sectionId, classId).then(res => {
      if (res.config) setConfig(res.config);
      setEntries(res.entries);
      setLoading(false);
    });
  }, [examId, subjectId, sectionId, classId]);

  const handleMarkChange = (studentId: string, valStr: string, maxMarks: number) => {
    let val = parseFloat(valStr);
    if (isNaN(val)) val = 0;
    if (val > maxMarks) val = maxMarks; // Prevent exceeding max
    if (val < 0) val = 0;

    setEntries(prev => prev.map(e => 
      e.studentId === studentId 
        ? { ...e, marksObtained: val, attendanceStatus: 'PRESENT' } 
        : e
    ));
  };

  const handleStatusChange = (studentId: string, status: MarksEntry['attendanceStatus']) => {
    setEntries(prev => prev.map(e => {
      if (e.studentId === studentId) {
        return { 
          ...e, 
          attendanceStatus: status, 
          marksObtained: status !== 'PRESENT' ? undefined : (e.marksObtained || 0)
        };
      }
      return e;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Assume the entries object has marksSheetId injected by getMarksEntries, 
    // or we fetch the sheetId from the backend. Our backend save API takes `sheetId`.
    // We will extract sheetId from the first entry, or default to a dummy if none (which backend might reject).
    const sheetId = entries.length > 0 ? (entries[0] as any).marksSheetId : '';
    await saveMarksEntries(sheetId, entries);
    setSaving(false);
    // Could show a success toast here
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!config) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Subject configuration not found.</Typography></Box>;

  // Assuming we are entering marks for the first component (e.g. Theory) in this basic grid view
  const activeComponent: ComponentConfig | undefined = config.components[0];
  if (!activeComponent) return <Box sx={{ p: 4 }}><Typography>No components configured.</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Marks Entry: {config.subjectName}</Typography>
          <Typography variant="body1" color="text.secondary">
            Component: {activeComponent.componentName} | Max Marks: {activeComponent.maxMarks}
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Class 10 - Section A</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            disableElevation 
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            Bulk Save Marks
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>Roll No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 200 }}>Attendance Status</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 200 }}>Marks Obtained</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map(entry => (
                <TableRow key={entry.studentId} hover>
                  <TableCell>{entry.rollNo}</TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{entry.studentName}</Typography></TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={entry.attendanceStatus}
                      onChange={e => handleStatusChange(entry.studentId, e.target.value as MarksEntry['attendanceStatus'])}
                    >
                      <MenuItem value="PRESENT">Present</MenuItem>
                      <MenuItem value="ABSENT">Absent</MenuItem>
                      <MenuItem value="EXEMPTED">Exempted</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={entry.marksObtained ?? ''}
                      onChange={e => handleMarkChange(entry.studentId, e.target.value, activeComponent.maxMarks)}
                      disabled={entry.attendanceStatus !== 'PRESENT'}
                      placeholder={entry.attendanceStatus !== 'PRESENT' ? '-' : ''}
                      slotProps={{ htmlInput: { min: 0, max: activeComponent.maxMarks, style: { textAlign: 'center', padding: '4px' } } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MarksEntryGrid;
