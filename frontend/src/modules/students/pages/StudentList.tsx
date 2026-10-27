import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Grid, Avatar, Chip, Collapse, FormControl,
  InputLabel, Select, MenuItem, Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../core/components/PageHeader';
import StatusBadge from '../../../core/components/StatusBadge';
import EmptyState from '../../../core/components/EmptyState';
import LoadingState from '../../../core/components/LoadingState';
import { getStudents } from '../api/student.api';
import { getClasses, getSections } from '../../academic/api/academic.api';
import type { StudentSummary } from '../api/student.api';
import type { ClassSummary, SectionSummary } from '../../academic/api/academic.api';

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const cls = await getClasses();
      setClasses(cls || []);
    } catch (e) {
      console.warn('Failed to load classes for filter:', e);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedClass !== 'ALL') {
      getSections(selectedClass).then(secs => setSections(secs || [])).catch(() => setSections([]));
    } else {
      setSections([]);
      setSelectedSection('ALL');
    }
  }, [selectedClass]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedClass !== 'ALL') params.classId = selectedClass;
      if (selectedSection !== 'ALL') params.sectionId = selectedSection;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedGender !== 'ALL') params.gender = selectedGender;
      if (selectedBloodGroup !== 'ALL') params.bloodGroup = selectedBloodGroup;

      const data = await getStudents(params);
      setStudents(data || []);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedClass, selectedSection, selectedStatus, selectedGender, selectedBloodGroup]);

  const resetFilters = () => {
    setSelectedGender('ALL');
    setSelectedStatus('ALL');
    setSelectedBloodGroup('ALL');
    setSelectedClass('ALL');
    setSelectedSection('ALL');
    setSearchTerm('');
  };

  const activeFilterCount = (selectedGender !== 'ALL' ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedBloodGroup !== 'ALL' ? 1 : 0) +
    (selectedClass !== 'ALL' ? 1 : 0) +
    (selectedSection !== 'ALL' ? 1 : 0);

  const filteredStudents = students;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <PageHeader 
        title="Students"
        description="Manage student admissions, profiles, enrollment and lifecycle."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Students', href: '/admin/students' },
          { label: 'Directory' }
        ]}
        primaryAction={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/admin/students/new')}
          >
            Add Student
          </Button>
        }
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="inherit" startIcon={<RefreshIcon />} onClick={fetchStudents}>
              Refresh
            </Button>
          </Box>
        }
      />

      {/* Toolbar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, ID, or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Badge badgeContent={activeFilterCount} color="primary">
              <Button
                startIcon={<FilterListIcon />}
                variant={showFilters ? 'contained' : 'outlined'}
                color={showFilters ? 'primary' : 'inherit'}
                onClick={() => setShowFilters(!showFilters)}
              >
                More Filters
              </Button>
            </Badge>
            {activeFilterCount > 0 && (
              <Button
                startIcon={<FilterListOffIcon />}
                variant="text"
                color="secondary"
                onClick={resetFilters}
              >
                Clear
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Collapsible Advanced Filters Drawer */}
        <Collapse in={showFilters}>
          <Box sx={{ pt: 2, mt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={selectedClass}
                    label="Class"
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <MenuItem value="ALL">All Classes</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id || (cls as any)._id} value={cls.id || (cls as any)._id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <FormControl fullWidth size="small" disabled={selectedClass === 'ALL'}>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={selectedSection}
                    label="Section"
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    <MenuItem value="ALL">All Sections</MenuItem>
                    {sections.map((sec) => (
                      <MenuItem key={sec.id || (sec as any)._id} value={sec.id || (sec as any)._id}>
                        {sec.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={selectedGender}
                    label="Gender"
                    onChange={(e) => setSelectedGender(e.target.value)}
                  >
                    <MenuItem value="ALL">All Genders</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="TRANSFERRED">Transferred</MenuItem>
                    <MenuItem value="GRADUATED">Graduated</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    value={selectedBloodGroup}
                    label="Blood Group"
                    onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  >
                    <MenuItem value="ALL">All Blood Groups</MenuItem>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Data Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class & Sec</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <LoadingState type="skeleton-table" />
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <EmptyState 
                      title="No students found"
                      description={searchTerm || activeFilterCount > 0 ? "Try adjusting your search or active filters." : "Get started by adding your first student."}
                      actionLabel={!searchTerm && activeFilterCount === 0 ? "Add Student" : undefined}
                      onAction={!searchTerm && activeFilterCount === 0 ? () => navigate('/admin/students/new') : undefined}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student: any, idx: number) => {
                  const palettes = [
                    { border: '#3b82f6', avatarBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', badgeBg: '#eff6ff', badgeText: '#1d4ed8', hover: '#f8faff' },
                    { border: '#8b5cf6', avatarBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', badgeBg: '#f5f3ff', badgeText: '#6d28d9', hover: '#faf5ff' },
                    { border: '#10b981', avatarBg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', badgeBg: '#ecfdf5', badgeText: '#047857', hover: '#f0fdf4' },
                    { border: '#f59e0b', avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', badgeBg: '#fffbeb', badgeText: '#b45309', hover: '#fffdf5' },
                    { border: '#ec4899', avatarBg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', badgeBg: '#fdf2f8', badgeText: '#be185d', hover: '#fff1f2' },
                    { border: '#06b6d4', avatarBg: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)', badgeBg: '#ecfeff', badgeText: '#0e7490', hover: '#f0fdfa' },
                  ];
                  const p = palettes[idx % palettes.length];

                  const className = student.currentEnrollmentId?.classId?.name || student.currentClass || '—';
                  const sectionName = student.currentEnrollmentId?.sectionId?.name || student.currentSection || '';

                  return (
                    <TableRow 
                      key={student.id || student._id} 
                      hover
                      sx={{ 
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: p.hover, transform: 'scale(1.001)' }
                      }}
                    >
                      <TableCell sx={{ borderLeft: `4px solid ${p.border}` }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                          {student.studentIdNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            src={student.photoUrl} 
                            sx={{ 
                              width: 36, 
                              height: 36, 
                              background: p.avatarBg,
                              color: '#fff',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                            }}
                          >
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              {student.firstName} {student.lastName}
                            </Typography>
                            {student.bloodGroup && (
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                Blood Group: {student.bloodGroup}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={sectionName ? `${className} - ${sectionName}` : className} 
                          size="small" 
                          sx={{ 
                            bgcolor: p.badgeBg, 
                            color: p.badgeText, 
                            fontWeight: 700,
                            borderRadius: '8px'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          {student.gender || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={student.status || 'ACTIVE'} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Profile">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/admin/students/${student.id || student._id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="info" onClick={() => navigate(`/admin/students/${student.id || student._id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Archive">
                          <IconButton size="small" color="error">
                            <ArchiveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StudentList;
