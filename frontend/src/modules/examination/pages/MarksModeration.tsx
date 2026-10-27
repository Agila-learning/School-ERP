import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';

const MarksModeration: React.FC = () => {
  const [modDialog, setModDialog] = useState(false);

  const [marks, setMarks] = useState<any[]>([]);

  React.useEffect(() => {
    // In full implementation, fetch students requiring moderation
    setMarks([]);
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Marks Moderation</Typography>
        <Typography variant="body2" color="text.secondary">Securely moderate marks preserving original audit trail</Typography>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Original Marks</TableCell>
                <TableCell>Moderated Marks</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {marks.map(m => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontWeight: 'medium' }}>{m.student}</TableCell>
                  <TableCell>{m.original} / {m.max}</TableCell>
                  <TableCell>
                    {m.moderated ? <Typography color="primary.main" sx={{ fontWeight: 'bold' }}>{m.original} &rarr; {m.moderated}</Typography> : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setModDialog(true)}>Moderate</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={modDialog} onClose={() => setModDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Moderate Marks</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Original Marks" value="38" disabled size="small" />
            <TextField type="number" label="New Moderated Marks" size="small" />
            <TextField label="Reason for Moderation" multiline rows={2} size="small" required />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModDialog(false)}>Cancel</Button>
          <Button variant="contained">Apply Moderation</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarksModeration;
