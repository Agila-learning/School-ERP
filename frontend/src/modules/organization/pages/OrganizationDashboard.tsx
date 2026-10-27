import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { fetchSchools, createSchool } from '../api/organization.api';
import type { School } from '../api/organization.api';

const OrganizationDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: '', code: '' });

  // Fetch Schools
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schools'],
    queryFn: () => fetchSchools(),
  });

  // Create School Mutation
  const mutation = useMutation({
    mutationFn: createSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setIsModalOpen(false);
      setNewSchool({ name: '', code: '' });
    },
  });

  const handleCreate = () => {
    if (newSchool.name && newSchool.code) {
      mutation.mutate(newSchool);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Organization Management</Typography>
        <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
          Add New Branch
        </Button>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : isError ? (
        <Typography color="error">Failed to load organizations.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((school: School) => (
                <TableRow key={school._id}>
                  <TableCell>{school.name}</TableCell>
                  <TableCell>{school.code}</TableCell>
                  <TableCell>{school.status}</TableCell>
                  <TableCell>
                    <Button size="small" color="primary">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No branches found. Create one!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Branch</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              label="Branch Name" 
              fullWidth 
              value={newSchool.name}
              onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
            />
            <TextField 
              label="Branch Code" 
              fullWidth 
              value={newSchool.code}
              onChange={(e) => setNewSchool({ ...newSchool, code: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Create Branch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationDashboard;
