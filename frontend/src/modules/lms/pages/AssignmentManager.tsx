import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import { Add, Edit, Delete, Publish, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAssignments, updateAssignment, deleteAssignment } from '../api/lms.api';
import dayjs from 'dayjs';

const AssignmentManager = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await getAssignments();
      setAssignments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment(id);
        fetchAssignments();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateAssignment(id, { status: 'PUBLISHED' });
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string): 'warning' | 'info' | 'success' | 'default' | 'primary' => {
    switch (status) {
      case 'DRAFT': return 'warning';
      case 'PUBLISHED': return 'info';
      case 'OPEN': return 'success';
      case 'CLOSED': return 'default';
      case 'ARCHIVED': return 'default';
      default: return 'primary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Assignment Manager</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/lms/assignments/new')}>
          Create Assignment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Class / Subject</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment._id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{assignment.title}</Typography>
                </TableCell>
                <TableCell><Chip size="small" label={assignment.type} /></TableCell>
                <TableCell>
                  <Typography variant="body2">{assignment.classId?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{assignment.subjectId?.name}</Typography>
                </TableCell>
                <TableCell>{dayjs(assignment.dueDate).format('DD MMM YYYY')}</TableCell>
                <TableCell>
                  <Chip size="small" label={assignment.status} color={getStatusColor(assignment.status)} />
                </TableCell>
                <TableCell align="right">
                  {assignment.status === 'DRAFT' && (
                    <IconButton size="small" color="primary" onClick={() => handlePublish(assignment._id)} title="Publish">
                      <Publish fontSize="small" />
                    </IconButton>
                  )}
                  {assignment.status !== 'DRAFT' && (
                    <IconButton size="small" color="info" onClick={() => navigate(`/lms/assignments/${assignment._id}/submissions`)} title="View Submissions">
                      <Visibility fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => navigate(`/lms/assignments/${assignment._id}/edit`)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(assignment._id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No assignments found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AssignmentManager;
