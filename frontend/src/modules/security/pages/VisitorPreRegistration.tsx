import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';

const VisitorPreRegistration: React.FC = () => {
  const [showForm, setShowForm] = React.useState(false);
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EventNoteIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Visitor Pre-Registration</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(f => !f)}>Pre-Register Visitor</Button>
      </Box>

      {showForm && (
        <Card sx={{ borderRadius: 2, mb: 3, border: '1px solid', borderColor: 'primary.light' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>New Pre-Registration</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Visitor Name" required /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Visitor Phone" required /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Visitor Organization" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Visitor Type</InputLabel>
                  <Select label="Visitor Type">
                    <MenuItem value="GUEST">Guest</MenuItem>
                    <MenuItem value="INTERVIEW_CANDIDATE">Interview Candidate</MenuItem>
                    <MenuItem value="VENDOR">Vendor</MenuItem>
                    <MenuItem value="CONSULTANT">Consultant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Purpose of Visit" required /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Host Employee Name/Dept" required /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Visit Date" type="date" slotProps={{ inputLabel: { shrink: true } }} required /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Expected Arrival" type="time" slotProps={{ inputLabel: { shrink: true } }} /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Expected Exit" type="time" slotProps={{ inputLabel: { shrink: true } }} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Vehicle Number (optional)" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Remarks" /></Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="contained">Create Pre-Registration</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Upcoming Pre-Registered Visitors</Typography>
          <Table>
            <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Ref Code</TableCell><TableCell>Visitor</TableCell><TableCell>Type</TableCell><TableCell>Host</TableCell><TableCell>Visit Date</TableCell><TableCell>Expected Time</TableCell><TableCell>Approval</TableCell><TableCell>Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>PRE-L7KX2A</TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>Dr. Anand Rao</Typography><Typography variant="caption" color="text.secondary">TechCorp Solutions</Typography></TableCell>
                <TableCell><Chip label="INTERVIEW_CANDIDATE" size="small" color="info" variant="outlined" /></TableCell>
                <TableCell>HR Department</TableCell>
                <TableCell>Aug 11, 2026</TableCell>
                <TableCell>10:00 AM – 12:00 PM</TableCell>
                <TableCell><Chip label="APPROVED" size="small" color="success" /></TableCell>
                <TableCell><Button size="small" variant="outlined">View</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>PRE-M9BZ4R</TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>Ms. Sunita Patel</Typography><Typography variant="caption" color="text.secondary">EdTech Partners</Typography></TableCell>
                <TableCell><Chip label="CONSULTANT" size="small" color="warning" variant="outlined" /></TableCell>
                <TableCell>Academic Head</TableCell>
                <TableCell>Aug 12, 2026</TableCell>
                <TableCell>02:00 PM – 04:00 PM</TableCell>
                <TableCell><Chip label="PENDING_HOST" size="small" color="warning" /></TableCell>
                <TableCell><Button size="small" variant="outlined" color="warning">Approve</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VisitorPreRegistration;
