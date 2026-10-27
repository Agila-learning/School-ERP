import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, Chip, Divider, CircularProgress, Alert } from '@mui/material';
import { CloudUpload, Send, Assignment as AssignmentIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignmentById, submitAssignment, getSubmissionsByAssignment } from '../api/lms.api';
import dayjs from 'dayjs';

const StudentAssignmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [mySubmission, setMySubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [submissionData, setSubmissionData] = useState({
    content: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const assignRes = await getAssignmentById(id as string);
      setAssignment(assignRes.data.data);
      
      // Attempt to get my previous submission (Backend controller getSubmissionsByAssignment should filter to my own if student)
      const subRes = await getSubmissionsByAssignment(id as string);
      if (subRes.data.data && subRes.data.data.length > 0) {
        // Sort to get the latest attempt
        const sorted = subRes.data.data.sort((a: any, b: any) => b.attemptNumber - a.attemptNumber);
        setMySubmission(sorted[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!submissionData.content.trim()) return alert('Please enter some content for your submission.');
    
    try {
      await submitAssignment(id as string, {
        content: submissionData.content,
        attachments: []
      });
      alert('Assignment submitted successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  if (loading) return <Box p={5} textAlign="center"><CircularProgress /></Box>;
  if (!assignment) return <Alert severity="error" sx={{ m: 3 }}>Assignment not found</Alert>;

  const isPastDue = new Date() > new Date(assignment.dueDate);
  const canSubmit = assignment.status === 'PUBLISHED' && 
                    (!mySubmission || (assignment.allowResubmission && mySubmission.status !== 'EVALUATED')) && 
                    (!isPastDue || assignment.allowLateSubmission);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>Assignment Details</Typography>
        <Button variant="outlined" onClick={() => navigate('/lms/student/dashboard')}>Back to Dashboard</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{assignment.title}</Typography>
              <Chip label={assignment.type} color="primary" />
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" display="block">Subject</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{assignment.subjectId?.name || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" display="block">Due Date</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }} color={isPastDue ? 'error.main' : 'text.primary'}>
                  {dayjs(assignment.dueDate).format('DD MMM YYYY, hh:mm A')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" display="block">Max Marks</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{assignment.maxMarks}</Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary" display="block">Submission Type</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{assignment.submissionType}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>Instructions</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {assignment.description}
            </Typography>
          </Paper>

          {/* Submission Area */}
          {canSubmit && assignment.submissionType !== 'OFFLINE' && (
            <Paper elevation={2} sx={{ p: 4, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom>Your Submission</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {mySubmission ? 'You are making a new attempt. Previous grades may be overridden depending on policy.' : 'Enter your answers or attach files below.'}
              </Typography>
              
              <TextField 
                fullWidth multiline rows={8} 
                variant="outlined" 
                placeholder="Type your answer here..."
                value={submissionData.content}
                onChange={(e) => setSubmissionData({ content: e.target.value })}
                sx={{ mb: 2, bgcolor: 'background.paper' }}
              />

              {assignment.submissionType === 'FILE_UPLOAD' && (
                <Box sx={{ mb: 2, p: 3, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center' }}>
                  <CloudUpload color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2">Drag & drop files here or click to browse</Typography>
                  <Button variant="outlined" size="small" sx={{ mt: 1 }}>Select File</Button>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" size="large" startIcon={<Send />} onClick={handleSubmit}>
                  Submit Assignment
                </Button>
              </Box>
            </Paper>
          )}

          {(!canSubmit && assignment.submissionType !== 'OFFLINE') && (
            <Alert severity="info" sx={{ mt: 3 }}>
              {mySubmission && mySubmission.status === 'EVALUATED' 
                ? 'Your submission has already been evaluated. No further attempts allowed.'
                : isPastDue && !assignment.allowLateSubmission
                  ? 'This assignment is past the due date and late submissions are not allowed.'
                  : !assignment.allowResubmission && mySubmission
                    ? 'You have already submitted this assignment. Multiple attempts are not allowed.'
                    : 'Submissions are currently closed.'
              }
            </Alert>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Submission Status</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {mySubmission ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip size="small" label={mySubmission.status} color={mySubmission.status === 'EVALUATED' ? 'success' : 'primary'} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Attempt</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>{mySubmission.attemptNumber}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Submitted At</Typography>
                  <Typography variant="body2">{dayjs(mySubmission.submittedAt).format('DD MMM YYYY')}</Typography>
                </Box>

                {mySubmission.status === 'EVALUATED' && (
                  <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>Evaluation Results</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Marks</Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>{mySubmission.evaluation?.marks} / {assignment.maxMarks}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Grade</Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>{mySubmission.evaluation?.grade}</Typography>
                    </Box>
                    {mySubmission.evaluation?.generalFeedback && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">Feedback:</Typography>
                        <Typography variant="body2">{mySubmission.evaluation.generalFeedback}</Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <AssignmentIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No submission yet.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentAssignmentView;
