import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, TextField, Table,
  TableBody, TableCell, TableHead, TableRow, Chip, Alert, Stepper, Step, StepLabel
} from '@mui/material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const StudentPickupManager: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showVerify, setShowVerify] = useState(false);
  const steps = ['Identify Student', 'Verify Pickup Person', 'Confirm Authorization', 'Release'];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ChildCareIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Student Pickup Management</Typography>
        </Box>
        <Button variant="contained" onClick={() => setShowVerify(true)}>Process Pickup</Button>
      </Box>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Important:</strong> Students must NEVER be released based on a name alone. Always verify the pickup person's identity against authorized records and confirm with school administration.
      </Alert>

      {showVerify && (
        <Card sx={{ borderRadius: 2, mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
              <VerifiedUserIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Student Release Verification
            </Typography>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>

            {activeStep === 0 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Student Name or Admission No." required /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Student Class/Section" /></Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ bgcolor: 'grey.50', p: 2 }}>
                    <Typography variant="body2">Search result: <strong>Arjun Sharma</strong> · Grade 7B · Adm#2024-0123</Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Pickup Person Full Name" required /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Pickup Person Phone" required /></Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ bgcolor: 'info.50', p: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Authorized Pickup Persons on Record:</Typography>
                    <Typography variant="body2">• Mrs. Sunita Sharma (Mother) — PERMANENT ✓</Typography>
                    <Typography variant="body2">• Mr. Vijay Sharma (Father) — PERMANENT ✓</Typography>
                    <Typography variant="body2">• Mr. Arun Kumar (Uncle) — TEMPORARY (valid until Aug 12) ✓</Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
            {activeStep === 2 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ bgcolor: 'success.50', p: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>✓ Authorization Verified</Typography>
                    <Typography variant="body2">Mrs. Sunita Sharma is PERMANENTLY authorized to pick up Arjun Sharma.</Typography>
                    <Typography variant="caption" color="text.secondary">Authorized by: School Administration on 2024-06-01</Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info">Staff must visually confirm the pickup person's identity with a valid government-issued photo ID before proceeding to release.</Alert>
                </Grid>
              </Grid>
            )}
            {activeStep === 3 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ bgcolor: 'warning.50', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.dark' }}>⚠ Final Confirmation Required</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>You are about to release <strong>Arjun Sharma (Grade 7B)</strong> to <strong>Mrs. Sunita Sharma</strong>.</Typography>
                    <Typography variant="caption" color="text.secondary">This action will be permanently recorded in the audit log with your name, time, and student ID.</Typography>
                  </Card>
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button color="error" onClick={() => { setShowVerify(false); setActiveStep(0); }}>Cancel</Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep > 0 && <Button onClick={() => setActiveStep(s => s - 1)}>Back</Button>}
                {activeStep < steps.length - 1
                  ? <Button variant="contained" onClick={() => setActiveStep(s => s + 1)}>Next</Button>
                  : <Button variant="contained" color="success" startIcon={<VerifiedUserIcon />}>Confirm Release & Record Exit</Button>
                }
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Today's Pickup Requests</Typography>
          <Table>
            <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Student</TableCell><TableCell>Class</TableCell><TableCell>Pickup Person</TableCell><TableCell>Relationship</TableCell><TableCell>Requested At</TableCell><TableCell>Authorization</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell>
            </TableRow></TableHead>
            <TableBody>
              <TableRow>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>Arjun Sharma</Typography></TableCell>
                <TableCell>7B</TableCell>
                <TableCell>Mrs. Sunita Sharma</TableCell>
                <TableCell>Mother</TableCell>
                <TableCell>11:30 AM</TableCell>
                <TableCell><Chip label="PERMANENT" size="small" color="success" /></TableCell>
                <TableCell><Chip label="WAITING" size="small" color="warning" /></TableCell>
                <TableCell><Button size="small" variant="contained" color="success" onClick={() => setShowVerify(true)}>Process</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>Meera Pillai</Typography></TableCell>
                <TableCell>5A</TableCell>
                <TableCell>Mr. Suresh Pillai</TableCell>
                <TableCell>Father</TableCell>
                <TableCell>12:45 PM</TableCell>
                <TableCell><Chip label="PERMANENT" size="small" color="success" /></TableCell>
                <TableCell><Chip label="COMPLETED" size="small" color="default" /></TableCell>
                <TableCell><Button size="small" variant="outlined" disabled>Released 12:58 PM</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentPickupManager;
