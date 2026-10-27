import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, LinearProgress, Alert, TextField, MenuItem, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getExams, calculateResults } from '../api/examination.api';


const ResultProcessor: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  useEffect(() => {
    getExams().then(data => {
      setExams(data);
      if (data.length > 0) setSelectedExamId(data[0].id);
      setLoading(false);
    });
  }, []);

  const handleProcess = async () => {
    if (!selectedExamId) return;
    setProcessing(true);
    setComplete(false);
    try {
      await calculateResults(selectedExamId);
      setResultMsg(`Processing completed! Calculated results successfully.`);
      setComplete(true);
    } catch (e: any) {
      setResultMsg(`Processing failed: ${e.response?.data?.message || e.message}`);
      setComplete(true);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 5 }}>
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Result Processing Engine</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Calculate final grades, percentages, and pass/fail statuses based on configured academic formulas.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            select
            fullWidth
            label="Select Exam"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
          >
            {exams.map((ex) => (
              <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Button 
          variant="contained" 
          size="large" 
          startIcon={<PlayArrowIcon />} 
          onClick={handleProcess}
          disabled={processing || !selectedExamId}
          sx={{ mb: 3 }}
        >
          {processing ? 'Processing...' : 'Run Processing Engine'}
        </Button>

        {processing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Calculating results in background...</Typography>
          </Box>
        )}

        {complete && (
          <Alert severity={resultMsg.includes('failed') ? 'error' : 'success'} sx={{ mt: 3, textAlign: 'left' }}>
            {resultMsg}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ResultProcessor;
