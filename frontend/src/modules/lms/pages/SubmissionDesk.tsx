import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Edit, Save, Visibility } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubmissionsByAssignment, evaluateSubmission, getAssignmentById } from '../api/lms.api';
import dayjs from 'dayjs';

const SubmissionDesk = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [evaluationModal, setEvaluationModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  
  const [evalData, setEvalData] = useState({
    marks: '',
    grade: '',
    generalFeedback: ''
  });

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      const [assignRes, subRes] = await Promise.all([
        getAssignmentById(assignmentId as string),
        getSubmissionsByAssignment(assignmentId as string)
      ]);
      setAssignment(assignRes.data.data);
      setSubmissions(subRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openEvaluation = (sub: any) => {
    setSelectedSub(sub);
    setEvalData({
      marks: sub.evaluation?.marks || '',
      grade: sub.evaluation?.grade || '',
      generalFeedback: sub.evaluation?.generalFeedback || ''
    });
    setEvaluationModal(true);
  };

  const submitEvaluation = async () => {
    try {
      await evaluateSubmission(selectedSub._id, {
        marks: Number(evalData.marks),
        grade: evalData.grade,
        generalFeedback: evalData.generalFeedback,
        status: 'EVALUATED'
      });
      setEvaluationModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Evaluation failed');
    }
  };

  if (!assignment) return <Box p={3}><Typography>Loading...</Typography></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>Submission Desk: {assignment.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Max Marks: {assignment.maxMarks} • Due: {dayjs(assignment.dueDate).format('DD MMM YYYY')}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/lms/assignments')}>Back to Assignments</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Attempt</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map(sub => (
              <TableRow key={sub._id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{sub.studentId?.firstName} {sub.studentId?.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{sub.studentId?.admissionNumber}</Typography>
                </TableCell>
                <TableCell>{dayjs(sub.submittedAt).format('DD MMM YYYY, hh:mm A')}</TableCell>
                <TableCell>{sub.attemptNumber}</TableCell>
                <TableCell>
                  <Chip size="small" label={sub.status} color={sub.status === 'EVALUATED' ? 'success' : (sub.status === 'LATE' ? 'error' : 'warning')} />
                </TableCell>
                <TableCell>
                  {sub.evaluation?.marks !== undefined ? `${sub.evaluation.marks} / ${assignment.maxMarks}` : '-'}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" onClick={() => openEvaluation(sub)}>
                    {sub.status === 'EVALUATED' ? 'Edit Grades' : 'Evaluate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No submissions yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={evaluationModal} onClose={() => setEvaluationModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Evaluate Submission: {selectedSub?.studentId?.firstName}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Student Answer</Typography>
              <Typography variant="body1">{selectedSub?.content || 'No text content provided.'}</Typography>
              {selectedSub?.attachments && selectedSub.attachments.length > 0 && (
                <Box mt={1}>
                  <Typography variant="subtitle2" color="text.secondary">Attachments:</Typography>
                  {selectedSub.attachments.map((file: string, i: number) => (
                    <Typography key={i} variant="body2" color="primary" sx={{ cursor: 'pointer' }}>Attachment {i + 1}</Typography>
                  ))}
                </Box>
              )}
            </Box>

            <TextField 
              label={`Marks (Out of ${assignment.maxMarks})`} 
              type="number" 
              value={evalData.marks} 
              onChange={e => setEvalData({...evalData, marks: e.target.value})}
              fullWidth 
            />
            <TextField 
              label="Grade (e.g. A, B+, Pass)" 
              value={evalData.grade} 
              onChange={e => setEvalData({...evalData, grade: e.target.value})}
              fullWidth 
            />
            <TextField 
              label="Feedback for Student" 
              multiline rows={3} 
              value={evalData.generalFeedback} 
              onChange={e => setEvalData({...evalData, generalFeedback: e.target.value})}
              fullWidth 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEvaluationModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitEvaluation}>Save Evaluation</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmissionDesk;
