import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Button, MenuItem, TextField
} from '@mui/material';
import { getExams, getSubjectConfigs } from '../api/examination.api';
import type { ExaminationMaster, SubjectExamConfig } from '../api/examination.api';

const SubjectAssessmentConfig: React.FC = () => {
  const [exams, setExams] = useState<ExaminationMaster[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [configs, setConfigs] = useState<SubjectExamConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExams().then(data => {
      setExams(data);
      if (data.length > 0) {
        setSelectedExamId(data[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      setLoading(true);
      getSubjectConfigs(selectedExamId).then(data => {
        setConfigs(data);
        setLoading(false);
      });
    }
  }, [selectedExamId]);

  if (loading && exams.length === 0) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Subject Assessment Config</Typography>
          <Typography variant="body1" color="text.secondary">
            Configure assessment components (Theory, Practical, Internal) and their weightages per subject.
          </Typography>
        </Box>
        <Box sx={{ minWidth: 250 }}>
          <TextField
            select
            label="Select Examination"
            fullWidth
            size="small"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
          >
            {exams.map(ex => (
              <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Components</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Max Marks</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Pass Marks</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configs.map(config => (
                  <TableRow key={config.id} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{config.subjectName}</Typography></TableCell>
                    <TableCell>
                      {config.components.map((c, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                          <Typography variant="caption" sx={{ width: 120, fontWeight: 600 }}>{c.componentName}</Typography>
                          <Typography variant="caption" color="text.secondary">Max: {c.maxMarks}</Typography>
                          <Typography variant="caption" color="text.secondary">Wgt: {c.weightagePercent}%</Typography>
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 700 }}>{config.totalMaxMarks}</Typography></TableCell>
                    <TableCell align="right">{config.totalPassMarks}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="text">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {configs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No subject configurations found for this exam.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default SubjectAssessmentConfig;
