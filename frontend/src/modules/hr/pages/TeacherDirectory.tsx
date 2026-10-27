import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Avatar, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import PageHeader from '../../../core/components/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge';
import EmptyState from '../../../core/components/EmptyState';
import LoadingState from '../../../core/components/LoadingState';

const TeacherDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teachers?page=${page}&limit=10`);
      setTeachers(res.data.data.teachers);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader 
        title="Teacher Directory"
        description="View and manage academic teaching staff and their assignments."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Academic', href: '/admin/academic' },
          { label: 'Teachers' }
        ]}
      />

      {loading ? (
        <LoadingState type="skeleton-table" />
      ) : teachers.length === 0 ? (
        <EmptyState 
          title="No teachers found"
          description="There are no employees configured as teaching staff."
        />
      ) : (
        <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Teacher</TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={teacher.photoUrl}>{teacher.firstName[0]}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {teacher.firstName} {teacher.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{teacher.employeeIdNumber}</TableCell>
                  <TableCell>{teacher.departmentId?.name || 'Academic'}</TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">{teacher.mobile}</Typography>
                    <Typography variant="caption" color="text.secondary">{teacher.email}</Typography>
                  </TableCell>
                  <TableCell><StatusBadge status={teacher.status} /></TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" onClick={() => navigate(`/admin/teachers/${teacher._id}`)}>
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</Box>
          <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </Box>
        </>
      )}
    </Box>
  );
};

export default TeacherDirectory;
