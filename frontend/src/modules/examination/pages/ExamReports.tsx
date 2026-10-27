import React from 'react';
import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';

const ExamReports: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Examination Reports</Typography>
        <Typography variant="body2" color="text.secondary">Download consolidated results, attendance, and analytics</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Available Reports</Typography>
            <List>
              <ListItem secondaryAction={<Button size="small" startIcon={<DownloadIcon />}>CSV</Button>}>
                <ListItemIcon><TableViewIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Consolidated Marksheet" secondary="Full class marks across all subjects" />
              </ListItem>
              <ListItem secondaryAction={<Button size="small" startIcon={<DownloadIcon />}>PDF</Button>}>
                <ListItemIcon><PictureAsPdfIcon color="error" /></ListItemIcon>
                <ListItemText primary="Failure Analysis" secondary="List of students requiring supplementary exams" />
              </ListItem>
              <ListItem secondaryAction={<Button size="small" startIcon={<DownloadIcon />}>PDF</Button>}>
                <ListItemIcon><PictureAsPdfIcon color="error" /></ListItemIcon>
                <ListItemText primary="Top Performers (Rank List)" secondary="Top 10 students by grade" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Logistics & Audit</Typography>
            <List>
              <ListItem secondaryAction={<Button size="small" startIcon={<DownloadIcon />}>PDF</Button>}>
                <ListItemIcon><PictureAsPdfIcon color="error" /></ListItemIcon>
                <ListItemText primary="Seating Plan" secondary="Room-wise seating allocation" />
              </ListItem>
              <ListItem secondaryAction={<Button size="small" startIcon={<DownloadIcon />}>CSV</Button>}>
                <ListItemIcon><TableViewIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Exam Attendance" secondary="Raw attendance data for all sessions" />
              </ListItem>
              <ListItem secondaryAction={<Button size="small" startIcon={<DownloadIcon />}>CSV</Button>}>
                <ListItemIcon><TableViewIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Marks Audit Trail" secondary="Log of original vs moderated marks" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExamReports;
