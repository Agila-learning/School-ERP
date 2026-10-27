import React from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import type { StudentProfileDetail } from '../api/student.api';

interface Props {
  student: StudentProfileDetail;
}

const StudentOverviewTab: React.FC<Props> = ({ student }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Personal Info */}
      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Personal Information</Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{student.dateOfBirth}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">Gender</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{student.gender}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">Blood Group</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{student.bloodGroup || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">Nationality</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{student.nationality}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">Category</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{student.category || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">Religion</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{student.religion || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Parent/Guardian Info */}
      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Parent / Guardian Details</Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={4}>
          {student.parents?.map((parent, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                  {parent.relationship}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {parent.firstName} {parent.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mobile: {parent.mobile}
                </Typography>
                {parent.email && (
                  <Typography variant="body2" color="text.secondary">
                    Email: {parent.email}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default StudentOverviewTab;
