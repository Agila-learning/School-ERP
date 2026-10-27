import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, TextField, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';

const GatePassManager: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AssignmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Gate Pass Management</Typography>
      </Box>
      <Button variant="contained" startIcon={<AddIcon />}>Issue Gate Pass</Button>
    </Box>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[{ label: 'Active Passes', value: 28, color: 'success.main' }, { label: 'Expiring Today', value: 7, color: 'warning.main' }, { label: 'Revoked', value: 3, color: 'error.main' }, { label: 'Pending Approval', value: 5, color: 'info.main' }].map(s => (
        <Grid size={{ xs: 6, md: 3 }} key={s.label}>
          <Card sx={{ borderRadius: 2, borderTop: 4, borderColor: s.color }}>
            <CardContent><Typography color="text.secondary" variant="subtitle2">{s.label}</Typography><Typography variant="h4" sx={{ fontWeight: 700 }}>{s.value}</Typography></CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField size="small" placeholder="Search by name or pass ID..." sx={{ flexGrow: 1 }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Pass Type</InputLabel>
            <Select label="Pass Type">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
              <MenuItem value="VISITOR">Visitor</MenuItem>
              <MenuItem value="VEHICLE">Vehicle</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
              <MenuItem value="REVOKED">Revoked</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Table>
          <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell>Pass ID</TableCell><TableCell>Person</TableCell><TableCell>Pass Type</TableCell><TableCell>Purpose</TableCell><TableCell>Valid From</TableCell><TableCell>Valid Until</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 700 }}>GP-L7KX2A</TableCell>
              <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>Arjun Sharma</Typography><Typography variant="caption" color="text.secondary">Student · Grade 7B</Typography></TableCell>
              <TableCell><Chip label="STUDENT_GATE_PASS" size="small" color="info" variant="outlined" /></TableCell>
              <TableCell>Medical Appointment</TableCell>
              <TableCell>Aug 10, 11:00 AM</TableCell>
              <TableCell>Aug 10, 04:00 PM</TableCell>
              <TableCell><Chip label="ACTIVE" size="small" color="success" /></TableCell>
              <TableCell>
                <Button size="small" variant="outlined" color="error" sx={{ mr: 1 }}>Revoke</Button>
                <Button size="small" variant="outlined">View QR</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 700 }}>GP-M9BZ4R</TableCell>
              <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>Rajesh Kumar</Typography><Typography variant="caption" color="text.secondary">Visitor</Typography></TableCell>
              <TableCell><Chip label="VISITOR_PASS" size="small" color="warning" variant="outlined" /></TableCell>
              <TableCell>Parent Meeting</TableCell>
              <TableCell>Aug 10, 10:00 AM</TableCell>
              <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>Aug 10, 12:00 PM ⚠</TableCell>
              <TableCell><Chip label="ACTIVE" size="small" color="success" /></TableCell>
              <TableCell>
                <Button size="small" variant="outlined" color="error" sx={{ mr: 1 }}>Revoke</Button>
                <Button size="small" variant="outlined">View QR</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </Box>
);

export default GatePassManager;
