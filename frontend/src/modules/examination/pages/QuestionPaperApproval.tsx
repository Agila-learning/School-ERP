import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField
} from '@mui/material';

const QuestionPaperApproval: React.FC = () => {
  const [actionDialog, setActionDialog] = useState<{ open: boolean, id: number | null, action: 'APPROVE' | 'REJECT' }>({ open: false, id: null, action: 'APPROVE' });

  // Mock
  const papers = [
    { id: 1, title: 'Mid-Term Mathematics Grade 10', author: 'Jane Smith', totalMarks: 100, status: 'UNDER_REVIEW' },
    { id: 2, title: 'Unit Test 1 Physics Grade 12', author: 'John Doe', totalMarks: 50, status: 'DRAFT' }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Question Paper Approvals</Typography>
        <Typography variant="body2" color="text.secondary">Review and approve examination papers before release</Typography>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell>Paper Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {papers.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 'medium' }}>{p.title}</TableCell>
                  <TableCell>{p.author}</TableCell>
                  <TableCell>{p.totalMarks}</TableCell>
                  <TableCell>
                    <Chip label={p.status} size="small" color={p.status === 'UNDER_REVIEW' ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" sx={{ mr: 1 }}>Preview</Button>
                    <Button size="small" color="success" onClick={() => setActionDialog({ open: true, id: p.id, action: 'APPROVE' })} disabled={p.status !== 'UNDER_REVIEW'}>Approve</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, id: null, action: 'APPROVE' })} maxWidth="sm" fullWidth>
        <DialogTitle>{actionDialog.action === 'APPROVE' ? 'Approve Paper' : 'Reject Paper'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Review the generated question paper. Once approved, it can be scheduled for the exam.
          </Typography>
          <TextField label="Remarks (Optional)" multiline rows={3} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, id: null, action: 'APPROVE' })}>Cancel</Button>
          <Button variant="contained" color={actionDialog.action === 'APPROVE' ? 'success' : 'error'}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionPaperApproval;
