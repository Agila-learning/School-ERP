import React from 'react';
import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function DocumentDashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="600">Document Dashboard</Typography>
        <Button variant="contained" startIcon={<CloudUploadIcon />} disableElevation>
          Upload Document
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.main' }}>
              <FolderIcon />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Documents</Typography>
              <Typography variant="h5" fontWeight="bold">1,245</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'success.light', borderRadius: 2, color: 'success.main' }}>
              <VerifiedUserIcon />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Verified</Typography>
              <Typography variant="h5" fontWeight="bold">982</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 2, color: 'warning.main' }}>
              <WarningAmberIcon />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Pending Approval</Typography>
              <Typography variant="h5" fontWeight="bold">45</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 2, minHeight: 400 }}>
        <Typography variant="h6" mb={2}>Recent Uploads</Typography>
        <Typography variant="body2" color="text.secondary">
          Document management table will be loaded here.
        </Typography>
      </Paper>
    </Box>
  );
}
