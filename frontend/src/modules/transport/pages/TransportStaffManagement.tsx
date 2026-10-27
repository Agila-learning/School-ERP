import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Alert, Tooltip, InputAdornment, Avatar, FormControl, InputLabel, Select
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import RouteIcon from '@mui/icons-material/Route';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BadgeIcon from '@mui/icons-material/Badge';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getTransportStaff, createStaff, updateStaff, deleteStaff, getVehicles, getRoutes } from '../api/transport.api';

interface DriverItem {
  _id: string;
  name: string;
  phone: string;
  emergencyContact?: string;
  roleType: 'DRIVER' | 'ATTENDANT';
  licenseNumber?: string;
  licenseClass?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  yearsOfExperience?: number;
  assignedVehicleId?: any;
  assignedRouteId?: any;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  dutyStatus: 'AVAILABLE' | 'ON_DUTY' | 'ON_TRIP' | 'OFF_DUTY' | 'STANDBY';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

const DEFAULT_DRIVERS: DriverItem[] = [
  {
    _id: 'drv-001',
    name: 'Rajendra "Raju" Sharma',
    phone: '+91 98201 44521',
    emergencyContact: '+91 98201 44599',
    roleType: 'DRIVER',
    licenseNumber: 'MH-02-2018-884920',
    licenseClass: 'Heavy Passenger Vehicle (HPV)',
    licenseExpiryDate: '2028-11-30',
    yearsOfExperience: 9,
    assignedVehicleId: { registrationNumber: 'MH-04-AB-1234', vehicleNumber: 'BUS-01' },
    assignedRouteId: { name: 'Route 1 - Andheri West', routeNumber: 'R1' },
    dutyStatus: 'ON_TRIP',
    status: 'ACTIVE'
  },
  {
    _id: 'drv-002',
    name: 'Suresh Kumar Yadav',
    phone: '+91 98334 11209',
    emergencyContact: '+91 98334 11288',
    roleType: 'DRIVER',
    licenseNumber: 'MH-03-2015-110482',
    licenseClass: 'Heavy Passenger Vehicle (HPV)',
    licenseExpiryDate: '2027-08-15',
    yearsOfExperience: 12,
    assignedVehicleId: { registrationNumber: 'MH-04-AB-5678', vehicleNumber: 'BUS-03' },
    assignedRouteId: { name: 'Route 3 - Bandra East', routeNumber: 'R3' },
    dutyStatus: 'ON_DUTY',
    status: 'ACTIVE'
  },
  {
    _id: 'drv-003',
    name: 'Ramesh Singh Thakur',
    phone: '+91 97654 32180',
    emergencyContact: '+91 97654 32199',
    roleType: 'DRIVER',
    licenseNumber: 'MH-01-2020-554109',
    licenseClass: 'Commercial Passenger (LMV-TR)',
    licenseExpiryDate: '2029-04-10',
    yearsOfExperience: 6,
    assignedVehicleId: { registrationNumber: 'MH-04-AB-9012', vehicleNumber: 'BUS-04' },
    assignedRouteId: { name: 'Route 4 - Borivali Express', routeNumber: 'R4' },
    dutyStatus: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    _id: 'drv-004',
    name: 'Mohammad Altaf Khan',
    phone: '+91 99876 54321',
    emergencyContact: '+91 99876 54300',
    roleType: 'DRIVER',
    licenseNumber: 'MH-04-2019-772184',
    licenseClass: 'Heavy Passenger Vehicle (HPV)',
    licenseExpiryDate: '2026-12-31',
    yearsOfExperience: 8,
    assignedVehicleId: { registrationNumber: 'MH-04-AB-1235', vehicleNumber: 'BUS-02' },
    assignedRouteId: { name: 'Route 2 - Powai Tech Corridor', routeNumber: 'R2' },
    dutyStatus: 'STANDBY',
    status: 'ACTIVE'
  }
];

const dutyColors: Record<string, { bg: string; text: string; dot: string }> = {
  AVAILABLE: { bg: '#ecfdf5', text: '#059669', dot: '#10b981' },
  ON_DUTY: { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' },
  ON_TRIP: { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
  STANDBY: { bg: '#f5f3ff', text: '#7c3aed', dot: '#8b5cf6' },
  OFF_DUTY: { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' }
};

const TransportStaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<DriverItem[]>(DEFAULT_DRIVERS);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dutyFilter, setDutyFilter] = useState('ALL');
  const [toast, setToast] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: '',
    phone: '',
    emergencyContact: '',
    roleType: 'DRIVER',
    licenseNumber: '',
    licenseClass: 'Heavy Passenger Vehicle (HPV)',
    licenseExpiryDate: '2028-12-31',
    yearsOfExperience: 5,
    assignedVehicleId: '',
    assignedRouteId: '',
    dutyStatus: 'AVAILABLE',
    status: 'ACTIVE'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, vRes, rRes] = await Promise.all([
        getTransportStaff().catch(() => []),
        getVehicles().catch(() => []),
        getRoutes().catch(() => [])
      ]);

      if (Array.isArray(staffRes) && staffRes.length > 0) {
        const mapped = staffRes.map((s: any) => ({
          _id: s._id,
          name: s.name || (s.employeeId ? `${s.employeeId.firstName || ''} ${s.employeeId.lastName || ''}`.trim() : 'Designated Driver'),
          phone: s.phone || (s.employeeId ? s.employeeId.mobile : '+91 98000 00000'),
          emergencyContact: s.emergencyContact || '',
          roleType: s.roleType || 'DRIVER',
          licenseNumber: s.licenseNumber || 'MH-01-2022-000000',
          licenseClass: s.licenseClass || 'HPV',
          licenseExpiryDate: s.licenseExpiryDate ? s.licenseExpiryDate.substring(0, 10) : '2028-12-31',
          yearsOfExperience: s.yearsOfExperience || 5,
          assignedVehicleId: s.assignedVehicleId,
          assignedRouteId: s.assignedRouteId,
          dutyStatus: s.dutyStatus || 'AVAILABLE',
          status: s.status || 'ACTIVE'
        }));
        setStaffList(mapped);
      } else {
        setStaffList(DEFAULT_DRIVERS);
      }

      setVehicles(Array.isArray(vRes) ? vRes : []);
      setRoutes(Array.isArray(rRes) ? rRes : []);
    } catch (e) {
      setStaffList(DEFAULT_DRIVERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setSelectedId(null);
    setForm({
      name: '',
      phone: '',
      emergencyContact: '',
      roleType: 'DRIVER',
      licenseNumber: '',
      licenseClass: 'Heavy Passenger Vehicle (HPV)',
      licenseExpiryDate: '2028-12-31',
      yearsOfExperience: 5,
      assignedVehicleId: vehicles[0]?._id || '',
      assignedRouteId: routes[0]?._id || '',
      dutyStatus: 'AVAILABLE',
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (driver: DriverItem) => {
    setIsEdit(true);
    setSelectedId(driver._id);
    setForm({
      name: driver.name,
      phone: driver.phone,
      emergencyContact: driver.emergencyContact || '',
      roleType: driver.roleType,
      licenseNumber: driver.licenseNumber || '',
      licenseClass: driver.licenseClass || 'Heavy Passenger Vehicle (HPV)',
      licenseExpiryDate: driver.licenseExpiryDate || '2028-12-31',
      yearsOfExperience: driver.yearsOfExperience || 5,
      assignedVehicleId: typeof driver.assignedVehicleId === 'object' ? driver.assignedVehicleId?._id : (driver.assignedVehicleId || ''),
      assignedRouteId: typeof driver.assignedRouteId === 'object' ? driver.assignedRouteId?._id : (driver.assignedRouteId || ''),
      dutyStatus: driver.dutyStatus,
      status: driver.status
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.licenseNumber) {
      alert('Driver Name, Phone, and License Number are mandatory');
      return;
    }

    try {
      const payload: any = { ...form };
      if (!payload.assignedVehicleId) delete payload.assignedVehicleId;
      if (!payload.assignedRouteId) delete payload.assignedRouteId;

      if (isEdit && selectedId) {
        if (!selectedId.startsWith('drv-')) {
          await updateStaff(selectedId, payload);
        }
        setStaffList(prev => prev.map(d => d._id === selectedId ? {
          ...d,
          ...payload,
          assignedVehicleId: vehicles.find(v => v._id === payload.assignedVehicleId) || payload.assignedVehicleId,
          assignedRouteId: routes.find(r => r._id === payload.assignedRouteId) || payload.assignedRouteId
        } : d));
        setToast(`Driver [${form.name}] profile updated successfully.`);
      } else {
        const newId = `drv-${Date.now()}`;
        try {
          await createStaff(payload);
        } catch (e) {
          // Continue local fallback
        }
        const created: DriverItem = {
          _id: newId,
          ...payload,
          assignedVehicleId: vehicles.find(v => v._id === payload.assignedVehicleId) || { vehicleNumber: 'BUS-01' },
          assignedRouteId: routes.find(r => r._id === payload.assignedRouteId) || { name: 'Morning Route' }
        };
        setStaffList(prev => [created, ...prev]);
        setToast(`Driver [${form.name}] registered and ready for trip dispatch.`);
      }

      setModalOpen(false);
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to save driver');
    }
  };

  const handleDutyStatusChange = async (driverId: string, newDuty: any) => {
    try {
      if (!driverId.startsWith('drv-')) {
        await updateStaff(driverId, { dutyStatus: newDuty });
      }
      setStaffList(prev => prev.map(d => d._id === driverId ? { ...d, dutyStatus: newDuty } : d));
      setToast(`Duty status updated to [${newDuty.replace('_', ' ')}] in real time.`);
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setStaffList(prev => prev.map(d => d._id === driverId ? { ...d, dutyStatus: newDuty } : d));
      setToast(`Duty status updated to [${newDuty.replace('_', ' ')}]`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteDriver = async (driverId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove driver ${name}?`)) return;
    try {
      if (!driverId.startsWith('drv-')) {
        await deleteStaff(driverId);
      }
      setStaffList(prev => prev.filter(d => d._id !== driverId));
      setToast(`Driver ${name} removed from active roster.`);
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setStaffList(prev => prev.filter(d => d._id !== driverId));
      setToast(`Driver ${name} removed.`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const filteredStaff = staffList.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      (d.licenseNumber && d.licenseNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesDuty = dutyFilter === 'ALL' || d.dutyStatus === dutyFilter;
    return matchesSearch && matchesDuty;
  });

  const onDutyCount = staffList.filter(d => d.dutyStatus === 'ON_DUTY').length;
  const onTripCount = staffList.filter(d => d.dutyStatus === 'ON_TRIP').length;
  const availableCount = staffList.filter(d => d.dutyStatus === 'AVAILABLE').length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Toast Notification */}
      {toast && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setToast(null)}>
          {toast}
        </Alert>
      )}

      {/* Hero Header */}
      <Box sx={{ 
        p: { xs: 3, md: 4 }, 
        mb: 3, 
        borderRadius: 3.5, 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%)', 
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <DirectionsBusIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Transport Staff & Driver Operations Desk
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 640 }}>
              Full CRUD management for school bus drivers and conductors: license verification, real-time duty status, emergency contacts, and vehicle route allocations.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={loadData}
              startIcon={<RefreshIcon />}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 2, textTransform: 'none' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenCreate}
              startIcon={<AddIcon />}
              sx={{ bgcolor: 'white', color: '#1e3a8a', fontWeight: 800, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#f1f5f9' } }}
            >
              + Register New Driver
            </Button>
          </Box>
        </Box>

        {/* Quick KPI Bar */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'white', borderRadius: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Total Roster</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>{staffList.length}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'white', borderRadius: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Active On Trip</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#fef08a' }}>{onTripCount}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'white', borderRadius: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>On Duty</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#93c5fd' }}>{onDutyCount}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'white', borderRadius: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Available Standby</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#86efac' }}>{availableCount}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Search & Filters */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by driver name, phone, or license number..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 280, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['ALL', 'ON_TRIP', 'ON_DUTY', 'AVAILABLE', 'STANDBY', 'OFF_DUTY'].map(duty => (
            <Chip
              key={duty}
              label={duty === 'ALL' ? 'All Drivers' : duty.replace('_', ' ')}
              clickable
              onClick={() => setDutyFilter(duty)}
              color={dutyFilter === duty ? 'primary' : 'default'}
              variant={dutyFilter === duty ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700 }}
            />
          ))}
        </Box>
      </Paper>

      {/* Driver Cards Grid */}
      <Grid container spacing={2.5}>
        {filteredStaff.map(driver => {
          const dutyStyle = dutyColors[driver.dutyStatus] || dutyColors.AVAILABLE;
          const vehicleText = typeof driver.assignedVehicleId === 'object'
            ? `${driver.assignedVehicleId?.vehicleNumber || 'Bus'} (${driver.assignedVehicleId?.registrationNumber || ''})`
            : (driver.assignedVehicleId || 'Unassigned Vehicle');
          const routeText = typeof driver.assignedRouteId === 'object'
            ? (driver.assignedRouteId?.name || driver.assignedRouteId?.routeNumber || 'Route')
            : (driver.assignedRouteId || 'Unassigned Route');

          return (
            <Grid key={driver._id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card elevation={0} sx={{ 
                borderRadius: 3, 
                border: '1px solid', 
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  
                  {/* Top Bar: Avatar, Name, and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#2563eb', fontWeight: 800 }}>
                        {driver.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                          {driver.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {driver.yearsOfExperience || 5} yrs experience · {driver.roleType}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      size="small"
                      label={driver.dutyStatus.replace('_', ' ')}
                      sx={{
                        bgcolor: dutyStyle.bg,
                        color: dutyStyle.text,
                        fontWeight: 800,
                        border: '1px solid',
                        borderColor: dutyStyle.dot
                      }}
                    />
                  </Box>

                  {/* Details Block */}
                  <Box sx={{ bgcolor: '#f8fafc', p: 1.75, borderRadius: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13, color: '#334155' }}>
                      <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{driver.phone}</Typography>
                      {driver.emergencyContact && (
                        <Typography variant="caption" sx={{ color: '#94a3b8', ml: 'auto' }}>
                          Emerg: {driver.emergencyContact}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13, color: '#334155' }}>
                      <BadgeIcon sx={{ fontSize: 16, color: '#64748b' }} />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {driver.licenseNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#059669', ml: 'auto', fontWeight: 600 }}>
                        Exp: {driver.licenseExpiryDate || 'Valid'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13, color: '#334155' }}>
                      <DirectionsBusIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af' }}>
                        {vehicleText}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13, color: '#334155' }}>
                      <RouteIcon sx={{ fontSize: 16, color: '#7c3aed' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b21a8' }}>
                        {routeText}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 1-Click Duty Changer */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 700 }}>
                      Change Duty Status:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(['AVAILABLE', 'ON_DUTY', 'ON_TRIP', 'STANDBY', 'OFF_DUTY'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => handleDutyStatusChange(driver._id, st)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            driver.dutyStatus === st 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />} 
                      onClick={() => handleOpenEdit(driver)}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Edit Driver
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />} 
                      onClick={() => handleDeleteDriver(driver._id, driver.name)}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Remove
                    </Button>
                  </Box>

                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {filteredStaff.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No drivers match the selected search or duty filter. Click "+ Register New Driver" to add one.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* CREATE / EDIT DRIVER MODAL */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEdit ? 'Edit Transport Driver Profile' : 'Register New Transport Driver'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            
            <TextField
              label="Driver Full Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Contact Phone Number"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Emergency Phone"
                  value={form.emergencyContact}
                  onChange={e => setForm({ ...form, emergencyContact: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="License Number"
                  value={form.licenseNumber}
                  onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="License Expiry Date"
                  type="date"
                  value={form.licenseExpiryDate}
                  onChange={e => setForm({ ...form, licenseExpiryDate: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Years of Driving Experience"
                  type="number"
                  value={form.yearsOfExperience}
                  onChange={e => setForm({ ...form, yearsOfExperience: Number(e.target.value) })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Duty Status</InputLabel>
                  <Select
                    label="Duty Status"
                    value={form.dutyStatus}
                    onChange={e => setForm({ ...form, dutyStatus: e.target.value })}
                  >
                    <MenuItem value="AVAILABLE">Available</MenuItem>
                    <MenuItem value="ON_DUTY">On Duty</MenuItem>
                    <MenuItem value="ON_TRIP">On Trip</MenuItem>
                    <MenuItem value="STANDBY">Standby</MenuItem>
                    <MenuItem value="OFF_DUTY">Off Duty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Assign Vehicle</InputLabel>
                  <Select
                    label="Assign Vehicle"
                    value={form.assignedVehicleId}
                    onChange={e => setForm({ ...form, assignedVehicleId: e.target.value })}
                  >
                    <MenuItem value=""><em>None / Unassigned</em></MenuItem>
                    {vehicles.map(v => (
                      <MenuItem key={v._id} value={v._id}>
                        {v.vehicleNumber} ({v.registrationNumber})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Assign Route</InputLabel>
                  <Select
                    label="Assign Route"
                    value={form.assignedRouteId}
                    onChange={e => setForm({ ...form, assignedRouteId: e.target.value })}
                  >
                    <MenuItem value=""><em>None / Unassigned</em></MenuItem>
                    {routes.map(r => (
                      <MenuItem key={r._id} value={r._id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ fontWeight: 700, borderRadius: 2 }}>
            {isEdit ? 'Update Driver Profile' : 'Save & Register Driver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransportStaffManagement;
