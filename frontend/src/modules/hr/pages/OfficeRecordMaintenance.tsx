import { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tabs, Tab } from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

export default function OfficeRecordMaintenance() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const records = [
    { id: 'DOC001', title: 'School Affiliation Certificate 2026', category: 'Certificates', uploadDate: '2026-01-15', size: '2.4 MB', status: 'Active' },
    { id: 'DOC002', title: 'Staff Holiday List 2026', category: 'Circulars', uploadDate: '2026-02-10', size: '1.1 MB', status: 'Active' },
    { id: 'DOC003', title: 'Transport Policy v2', category: 'Policies', uploadDate: '2025-11-20', size: '3.5 MB', status: 'Archived' },
    { id: 'DOC004', title: 'Annual Budget Report 2025-26', category: 'Financial', uploadDate: '2026-03-31', size: '5.8 MB', status: 'Active' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Office Record Maintenance
        </Typography>
        <Button variant="contained" startIcon={<FileUploadOutlinedIcon />} sx={{ textTransform: 'none', px: 3, borderRadius: 2 }}>
          Upload New Record
        </Button>
      </Box>

      <Paper sx={{ mb: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2, pt: 1, borderBottom: '1px solid #e2e8f0' }}>
          <Tab label="All Documents" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Staff Records" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Student Certificates" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Compliance & Audits" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth placeholder="Search records by title or ID..." size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField select fullWidth label="Filter Department" size="small" slotProps={{ htmlInput: { native: true } }}>
                <option value="all">All Categories</option>
                <option value="certificates">Certificates</option>
                <option value="circulars">Circulars</option>
                <option value="policies">Policies</option>
              </TextField>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Record ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Upload Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#64748b' }}>{row.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{row.title}</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>Size: {row.size}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.category} size="small" sx={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>{row.uploadDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status} 
                        size="small" 
                        color={row.status === 'Active' ? 'success' : 'default'}
                        variant={row.status === 'Active' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton size="small" color="primary"><VisibilityOutlinedIcon /></IconButton>
                      <IconButton size="small" color="primary"><DownloadIcon /></IconButton>
                      <IconButton size="small" color="error"><DeleteOutlinedIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
}
