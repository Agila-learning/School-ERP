import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

export default function DocumentManager() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="600" mb={3}>All Documents</Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Birth_Certificate.pdf</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>John Doe</TableCell>
              <TableCell><Chip label="VERIFIED" color="success" size="small" /></TableCell>
              <TableCell>2026-09-23</TableCell>
              <TableCell align="right">
                <IconButton size="small"><VisibilityIcon /></IconButton>
                <IconButton size="small"><DownloadIcon /></IconButton>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Offer_Letter_Signed.pdf</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Jane Smith</TableCell>
              <TableCell><Chip label="PENDING" color="warning" size="small" /></TableCell>
              <TableCell>2026-09-22</TableCell>
              <TableCell align="right">
                <IconButton size="small"><VisibilityIcon /></IconButton>
                <IconButton size="small"><DownloadIcon /></IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
