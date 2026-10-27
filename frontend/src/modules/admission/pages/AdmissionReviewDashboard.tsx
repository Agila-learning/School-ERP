import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, TextField, Alert
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { getApplications, approveApplication } from '../api/admission.api';
import { getClasses, getSections } from '../../academic/api/academic.api';
import type { ClassSummary, SectionSummary } from '../../academic/api/academic.api';

const AdmissionReviewDashboard: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Approval modal state
  const [approveDialog, setApproveDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('');
  const [approving, setApproving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getClasses().then(c => setClasses(c || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [refresh]);

  useEffect(() => {
    if (targetClass) {
      getSections(targetClass).then(s => setSections(s || [])).catch(() => setSections([]));
    } else {
      setSections([]);
    }
  }, [targetClass]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await getApplications();
      if (res.success) {
        setApplications(res.data.map((item: any) => ({ ...item, id: item._id })));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (row: any) => {
    setSelectedApp(row);
    setTargetClass(row.applyingClassId || (classes[0]?.id || ''));
    setTargetSection('');
    setErrorMsg('');
    setApproveDialog(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedApp || !targetClass) return;
    setApproving(true);
    setErrorMsg('');
    try {
      await approveApplication(selectedApp.id, targetClass, true);
      setApproveDialog(false);
      setRefresh(r => r + 1);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Approval failed. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const filteredApps = applications.filter(a => {
    const matchClass = selectedClassFilter === 'ALL' || a.applyingClassId === selectedClassFilter;
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchClass && matchStatus;
  });

  const columns: GridColDef[] = [
    { field: 'applicationNumber', headerName: 'App No', width: 130 },
    { 
      field: 'studentName', 
      headerName: 'Student Name', 
      width: 220,
      valueGetter: (_: any, row: any) => `${row.studentDetails?.firstName || ''} ${row.studentDetails?.lastName || ''}`
    },
    { 
      field: 'applyingClassId', 
      headerName: 'Class Applied', 
      width: 170,
      valueGetter: (value: any) => {
        const cls = classes.find(c => c.id === value || (c as any)._id === value);
        return cls?.name || value || 'Class';
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'ADMITTED' ? 'success' : params.value === 'SUBMITTED' ? 'warning' : 'default'} 
          size="small" 
          sx={{ fontWeight: 700 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      renderCell: (params) => (
        params.row.status === 'SUBMITTED' ? (
          <Button 
            variant="contained" 
            size="small" 
            color="success"
            onClick={() => openApproveModal(params.row)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Review & Admit
          </Button>
        ) : (
          <Chip label="Enrolled in School" size="small" variant="outlined" color="success" />
        )
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
        Admission Desk & Application Review
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Process incoming admission forms and sync admitted students into academic classes and student rosters.
      </Typography>
      
      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#e2e8f0' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Applications
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5 }}>
                {applications.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#fde68a', bgcolor: '#fffbeb' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>
                Pending Review
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#d97706', mt: 0.5 }}>
                {applications.filter(a => a.status === 'SUBMITTED').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#bbf7d0', bgcolor: '#f0fdf4' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>
                Admitted & Enrolled
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                {applications.filter(a => a.status === 'ADMITTED').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Class</InputLabel>
          <Select
            value={selectedClassFilter}
            label="Filter by Class"
            onChange={(e) => setSelectedClassFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Classes</MenuItem>
            {classes.map(c => (
              <MenuItem key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Application Status</InputLabel>
          <Select
            value={statusFilter}
            label="Application Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="SUBMITTED">Pending Review</MenuItem>
            <MenuItem value="ADMITTED">Admitted</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>

        {(selectedClassFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <Button 
            size="small" 
            variant="text" 
            onClick={() => { setSelectedClassFilter('ALL'); setStatusFilter('ALL'); }}
            sx={{ textTransform: 'none' }}
          >
            Reset Filters
          </Button>
        )}
      </Paper>

      {/* DataGrid */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ height: 480, width: '100%' }}>
          <DataGrid
            rows={filteredApps}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
          />
        </Box>
      </Paper>

      {/* Approve & Assign Section Modal */}
      <Dialog open={approveDialog} onClose={() => !approving && setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Admit Student & Assign Class Roster
        </DialogTitle>
        <DialogContent dividers>
          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
          <Typography variant="body2" sx={{ mb: 2 }}>
            Confirm admission for <strong>{selectedApp?.studentDetails?.firstName} {selectedApp?.studentDetails?.lastName}</strong> (App #{selectedApp?.applicationNumber}).
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Enrolling Class</InputLabel>
                <Select
                  value={targetClass}
                  label="Enrolling Class"
                  onChange={(e) => setTargetClass(e.target.value)}
                >
                  {classes.map(c => (
                    <MenuItem key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Section (Optional)</InputLabel>
                <Select
                  value={targetSection}
                  label="Section (Optional)"
                  onChange={(e) => setTargetSection(e.target.value)}
                >
                  <MenuItem value="">Unassigned Section</MenuItem>
                  {sections.map(s => (
                    <MenuItem key={s.id || (s as any)._id} value={s.id || (s as any)._id}>
                      Section {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApproveDialog(false)} disabled={approving}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleConfirmApproval}
            disabled={approving || !targetClass}
            sx={{ fontWeight: 700 }}
          >
            {approving ? 'Enrolling...' : 'Confirm Admission'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdmissionReviewDashboard;
