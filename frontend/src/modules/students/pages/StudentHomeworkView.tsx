import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getHomeworks, submitHomework, getMySubmissions } from '../../academic/api/academic.api';

const StudentHomeworkView: React.FC = () => {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionContent, setSubmissionContent] = useState('');

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const hwData = await getHomeworks();
      const subData = await getMySubmissions();
      setHomeworks(hwData);
      setSubmissions(subData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const handleOpenSubmit = (hw: any) => {
    setSelectedHomework(hw);
    setSubmissionContent('');
    setSubmitModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedHomework) return;
    try {
      await submitHomework(selectedHomework.id || selectedHomework._id, { content: submissionContent });
      setSubmitModalOpen(false);
      alert('Homework submitted successfully!');
      fetchHomeworks();
    } catch (e) {
      alert('Failed to submit homework');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>My Homework</Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {homeworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No homework assigned right now.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                homeworks.map(hw => {
                  const submission = submissions.find(s => s.assignmentId === (hw.id || hw._id));
                  const isSubmitted = !!submission; 
                  return (
                    <TableRow key={hw.id || hw._id} hover>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{hw.title}</Typography></TableCell>
                      <TableCell>{hw.subjectId?.name || 'Unknown Subject'}</TableCell>
                      <TableCell>{new Date(hw.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={isSubmitted ? 'Submitted' : 'Pending'} 
                          color={isSubmitted ? 'success' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        {isSubmitted ? (
                          <Button size="small" color="success" startIcon={<CheckCircleIcon />} disabled>Submitted</Button>
                        ) : (
                          <Button size="small" variant="contained" startIcon={<UploadFileIcon />} disableElevation onClick={() => handleOpenSubmit(hw)}>
                            Submit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={submitModalOpen} onClose={() => setSubmitModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Homework: {selectedHomework?.title}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>{selectedHomework?.description}</Typography>
          <TextField 
            label="Your Answer / Google Drive Link" 
            fullWidth 
            multiline
            rows={6}
            value={submissionContent}
            onChange={e => setSubmissionContent(e.target.value)}
            placeholder="Type your answer here or paste a link to your document..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!submissionContent}>
            Turn In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentHomeworkView;
