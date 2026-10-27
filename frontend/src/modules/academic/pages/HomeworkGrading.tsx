import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getHomeworkSubmissions, gradeHomework } from '../api/academic.api';

const HomeworkGrading: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [gradeData, setGradeData] = useState({ grade: '', remarks: '' });

  const fetchSubmissions = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getHomeworkSubmissions(id);
      setSubmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const handleOpenGrade = (sub: any) => {
    setSelectedSub(sub);
    setGradeData({ grade: sub.grade || '', remarks: sub.remarks || '' });
    setOpenModal(true);
  };

  const handleGrade = async () => {
    if (!selectedSub) return;
    try {
      await gradeHomework(selectedSub._id, gradeData);
      setOpenModal(false);
      fetchSubmissions();
    } catch (e) {
      alert('Failed to grade homework');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/admin/academics/homework')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Grade Submissions</Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Content / Link</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No submissions yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map(sub => (
                  <TableRow key={sub._id} hover>
                    <TableCell>{sub.studentId?.firstName} {sub.studentId?.lastName}</TableCell>
                    <TableCell>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>
                      {sub.content?.startsWith('http') ? (
                        <a href={sub.content} target="_blank" rel="noreferrer">View Link</a>
                      ) : (
                        <Typography variant="body2" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sub.content || 'No content'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sub.status} 
                        color={sub.status === 'GRADED' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{sub.grade || '-'}</TableCell>
                    <TableCell align="right">
                      <Button 
                        size="small" 
                        variant="contained" 
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleOpenGrade(sub)}
                      >
                        {sub.status === 'GRADED' ? 'Update Grade' : 'Grade'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Grade Homework for {selectedSub?.studentId?.firstName}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>Student's Answer:</Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selectedSub?.content || 'No text content provided.'}</Typography>
          </Paper>

          <TextField 
            label="Grade (e.g. A+, 95/100)" 
            fullWidth margin="normal"
            value={gradeData.grade}
            onChange={e => setGradeData({ ...gradeData, grade: e.target.value })}
          />
          <TextField 
            label="Teacher Remarks" 
            fullWidth margin="normal"
            multiline rows={3}
            value={gradeData.remarks}
            onChange={e => setGradeData({ ...gradeData, remarks: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGrade} disabled={!gradeData.grade}>Save Grade</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomeworkGrading;
