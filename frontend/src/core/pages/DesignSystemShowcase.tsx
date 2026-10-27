import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, TextField, 
  Divider, MenuItem, Select, FormControl, InputLabel, 
  IconButton, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PageHeader from '../layout/PageHeader';
import DataTable from '../../shared/components/ui/DataTable';
import type { Column } from '../../shared/components/ui/DataTable';
import StatusBadge from '../../shared/components/ui/StatusBadge';
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog';

const columns: Column[] = [
  { id: 'name', label: 'Name' },
  { id: 'role', label: 'Role' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: 'Actions', align: 'right' }
];

const mockRows = [
  { id: 1, name: 'Arjun Reddy', role: 'Student', status: <StatusBadge status="success" label="Active" /> },
  { id: 2, name: 'Priya Sharma', role: 'Teacher', status: <StatusBadge status="info" label="On Leave" /> },
  { id: 3, name: 'Rahul Verma', role: 'Admin', status: <StatusBadge status="warning" label="Pending" /> },
  { id: 4, name: 'Sneha Patel', role: 'Student', status: <StatusBadge status="error" label="Suspended" /> },
];

const DesignSystemShowcase: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <Box>
      <PageHeader 
        title="Design System Showcase" 
        description="A unified reference for all UI components in the School ERP."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Design System' }
        ]}
        actions={[
          { label: 'Primary Action', onClick: () => alert('Action clicked'), icon: <SaveIcon /> },
          { label: 'Secondary', variant: 'outlined', onClick: () => {} }
        ]}
      />

      <Grid container spacing={4}>
        {/* Typography */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Typography</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h1">Heading 1</Typography>
              <Typography variant="h2">Heading 2</Typography>
              <Typography variant="h3">Heading 3</Typography>
              <Typography variant="h4">Heading 4</Typography>
              <Typography variant="h5">Heading 5</Typography>
              <Typography variant="h6">Heading 6</Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Subtitle 1 - used for secondary headers</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>Body 1 - Standard paragraph text. The quick brown fox jumps over the lazy dog.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Body 2 - Secondary text or helper text. The quick brown fox jumps over the lazy dog.</Typography>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Caption text for tiny disclaimers.</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Buttons */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Buttons</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button variant="contained" color="primary">Primary</Button>
                <Button variant="contained" color="secondary">Secondary</Button>
                <Button variant="contained" color="error">Danger</Button>
                <Button variant="contained" color="success">Success</Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button variant="outlined" color="primary">Outline</Button>
                <Button variant="text" color="primary">Ghost</Button>
                <Button variant="contained" disabled>Disabled</Button>
                <Button variant="contained" startIcon={<CircularProgress size={20} color="inherit" />}>
                  Loading...
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}><EditIcon /></IconButton>
                <IconButton color="error" sx={{ border: '1px solid', borderColor: 'divider' }}><DeleteIcon /></IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Forms */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Forms & Inputs</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField label="Standard Text Input" variant="outlined" fullWidth placeholder="Enter your name" />
                
                <TextField 
                  label="Input with Error" 
                  variant="outlined" 
                  fullWidth 
                  error 
                  helperText="This field is required." 
                  defaultValue="Invalid value"
                />

                <FormControl fullWidth>
                  <InputLabel>Select Role</InputLabel>
                  <Select value="" label="Select Role">
                    <MenuItem value="admin">Administrator</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Multiline Textarea"
                  multiline
                  rows={4}
                  placeholder="Enter details here..."
                  variant="outlined"
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Badges and Feedback */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Status Badges & Modals</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                <StatusBadge status="success" label="Active" />
                <StatusBadge status="warning" label="Pending" />
                <StatusBadge status="error" label="Failed" />
                <StatusBadge status="info" label="In Progress" />
                <StatusBadge status="neutral" label="Archived" />
              </Box>

              <Button variant="contained" color="error" onClick={() => setDialogOpen(true)}>
                Trigger Confirm Dialog
              </Button>

              <ConfirmDialog
                open={dialogOpen}
                title="Delete Student Record?"
                message="Are you sure you want to delete this student record? This action cannot be undone and will permanently remove all associated data including grades and attendance."
                confirmLabel="Delete Permanently"
                isDestructive={true}
                onCancel={() => setDialogOpen(false)}
                onConfirm={() => setDialogOpen(false)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Data Table */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mt: 2 }}>Data Table</Typography>
          <DataTable
            columns={columns}
            rows={mockRows.map(row => ({
              ...row,
              actions: (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              )
            }))}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={15}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DesignSystemShowcase;
