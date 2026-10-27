import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PreviewIcon from '@mui/icons-material/Preview';
import DeleteIcon from '@mui/icons-material/Delete';

const QuestionPaperBuilder: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);

  React.useEffect(() => {
    // In full implementation, fetch from QuestionBank API
    setQuestions([]);
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Question Paper Builder</Typography>
          <Typography variant="body2" color="text.secondary">Design exams manually or using blueprint auto-generation</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<PreviewIcon />}>Preview</Button>
          <Button variant="contained">Submit for Approval</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Paper Metadata</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Subject" value="Mathematics" size="small" disabled fullWidth />
              <TextField label="Grade" value="Grade 10" size="small" disabled fullWidth />
              <TextField label="Total Marks" value="100" size="small" fullWidth />
              <TextField label="Duration (Minutes)" value="120" size="small" fullWidth />
              <TextField label="General Instructions" multiline rows={3} size="small" fullWidth />
              <Button variant="outlined" startIcon={<AutoFixHighIcon />} sx={{ mt: 2 }}>Auto-Generate from Blueprint</Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Selected Questions</Typography>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>Total Marks: {questions.reduce((a, q) => a + q.marks, 0)}</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Question</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Marks</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((q, i) => (
                    <TableRow key={q.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>{q.text}</Typography>
                      </TableCell>
                      <TableCell><Chip label={q.type} size="small" variant="outlined" /></TableCell>
                      <TableCell>{q.marks}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ p: 2 }}>
              <Button variant="text" fullWidth>+ Browse Question Bank</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestionPaperBuilder;
