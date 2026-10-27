import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Chip, LinearProgress, Alert
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const EligibilityEngineView: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const students = [
    { id: 1, name: 'Alice Smith', class: 'Grade 10', policy: 'High School Policy v2', attendance: 'MET', academic: 'MET', status: 'ELIGIBLE' },
    { id: 2, name: 'Bob Johnson', class: 'Grade 10', policy: 'High School Policy v2', attendance: 'MET', academic: 'FAILED', status: 'NOT_ELIGIBLE' },
    { id: 3, name: 'Charlie Davis', class: 'Grade 10', policy: 'High School Policy v2', attendance: 'FAILED', academic: 'MET', status: 'PENDING_REVIEW' },
  ];

  const handleRunEvaluation = () => {
    setProcessing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessing(false);
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Eligibility Evaluation Engine</Typography>
          <Typography variant="body2" color="text.secondary">Cross-reference final results and attendance against promotion policies</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PlayArrowIcon />} 
          onClick={handleRunEvaluation}
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Run Bulk Evaluation'}
        </Button>
      </Box>

      {processing && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Evaluating 1,200 students... ({progress}%)</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      <Alert severity="warning" sx={{ mb: 3 }}>
        Evaluating eligibility does not execute promotions. It generates a recommended status for teachers to review.
      </Alert>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Student Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Applied Policy</TableCell>
                <TableCell>Attendance Req.</TableCell>
                <TableCell>Academic Req.</TableCell>
                <TableCell>Calculated Eligibility</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(s => (
                <TableRow key={s.id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{s.name}</Typography></TableCell>
                  <TableCell>{s.class}</TableCell>
                  <TableCell>{s.policy}</TableCell>
                  <TableCell>
                    {s.attendance === 'MET' ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                  </TableCell>
                  <TableCell>
                    {s.academic === 'MET' ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={s.status.replace('_', ' ')} 
                      size="small" 
                      color={s.status === 'ELIGIBLE' ? 'success' : s.status === 'NOT_ELIGIBLE' ? 'error' : 'warning'} 
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

export default EligibilityEngineView;
