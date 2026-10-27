import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getExams, publishResults } from '../api/examination.api';

const ResultPublisher: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await getExams();
      setExams(data.filter((e: any) => e.status !== 'PUBLISHED' && e.status !== 'DRAFT'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedExam) return;
    setPublishing(true);
    try {
      await publishResults(selectedExam);
      alert('Results published and notifications sent successfully!');
      setSelectedExam('');
      fetchExams();
    } catch (err) {
      console.error(err);
      alert('Failed to publish results. Ensure results are calculated first.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 5 }}>
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <AssessmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Result Publisher
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Make approved results available on the Student and Parent portals. Notifications will be sent automatically.
        </Typography>

        {loading ? <CircularProgress sx={{ mb: 4 }} /> : (
          <FormControl fullWidth sx={{ mb: 4, textAlign: 'left' }}>
            <InputLabel>Select Exam to Publish</InputLabel>
            <Select
              value={selectedExam}
              label="Select Exam to Publish"
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              {exams.map(exam => (
                <MenuItem key={exam._id} value={exam._id}>{exam.name} ({exam.academicYearId?.name || ''})</MenuItem>
              ))}
              {exams.length === 0 && <MenuItem disabled value="">No pending exams to publish</MenuItem>}
            </Select>
          </FormControl>
        )}

        <Button 
          variant="contained" 
          size="large" 
          startIcon={<SendIcon />} 
          fullWidth
          disabled={!selectedExam || publishing}
          onClick={handlePublish}
        >
          {publishing ? 'Publishing...' : 'Publish Results Now'}
        </Button>
      </Paper>
    </Box>
  );
};

export default ResultPublisher;
