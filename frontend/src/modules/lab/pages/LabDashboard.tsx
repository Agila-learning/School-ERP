import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  Science as ScienceIcon,
  Computer as ComputerIcon,
  Engineering as EngineeringIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EventAvailable as EventAvailableIcon,
  WarningAmber as WarningAmberIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  MeetingRoom as MeetingRoomIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import LabSessionAttendanceDesk from '../components/LabSessionAttendanceDesk';
import LabObservationsDesk from '../components/LabObservationsDesk';
import {
  getLabDashboardStats,
  getLaboratories,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking
} from '../api/lab.api';

const LAB_TYPES = ['COMPUTER', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'ROBOTICS', 'LANGUAGE', 'OTHER'];
const LAB_STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'];
const EQ_CATEGORIES = ['COMPUTING', 'OPTICS', 'MEASUREMENT', 'ROBOTICS', 'DISPLAY', 'GLASSWARE', 'POWER', 'OTHER'];
const EQ_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'MAINTENANCE_REQUIRED', 'DAMAGED'];
const EQ_STATUSES = ['AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED'];
const INV_CATEGORIES = ['CHEMICALS', 'GLASSWARE', 'CONSUMABLES', 'ELECTRONICS', 'SPECIMENS', 'OTHER'];
const BOOKING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

export const LabDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string) => {
    if (path.includes('/equipment')) return 1;
    if (path.includes('/inventory')) return 2;
    if (path.includes('/bookings') || path.includes('/schedule')) return 3;
    if (path.includes('/attendance')) return 4;
    if (path.includes('/observations')) return 5;
    return 0;
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    const targetTab = getTabFromPath(location.pathname);
    if (targetTab !== activeTab) {
      setActiveTab(targetTab);
    }
  }, [location.pathname]);

  const handleTabChange = (_: any, val: number) => {
    setActiveTab(val);
    setSearchQuery('');
    if (val === 0) navigate('/lab/dashboard');
    else if (val === 1) navigate('/lab/equipment');
    else if (val === 2) navigate('/lab/inventory');
    else if (val === 3) navigate('/lab/bookings');
    else if (val === 4) navigate('/lab/attendance');
    else if (val === 5) navigate('/lab/observations');
  };

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [labs, setLabs] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Modal States
  const [labModal, setLabModal] = useState<{ open: boolean; isEdit: boolean; data: any }>({
    open: false,
    isEdit: false,
    data: {}
  });

  const [eqModal, setEqModal] = useState<{ open: boolean; isEdit: boolean; data: any }>({
    open: false,
    isEdit: false,
    data: {}
  });

  const [invModal, setInvModal] = useState<{ open: boolean; isEdit: boolean; data: any }>({
    open: false,
    isEdit: false,
    data: {}
  });

  const [bookingModal, setBookingModal] = useState<{ open: boolean; isEdit: boolean; data: any }>({
    open: false,
    isEdit: false,
    data: {}
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'LAB' | 'EQUIPMENT' | 'INVENTORY' | 'BOOKING';
    id: string;
    title: string;
  }>({
    open: false,
    type: 'LAB',
    id: '',
    title: ''
  });

  const [submitting, setSubmitting] = useState(false);

  // Load All Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, labsData, eqData, invData, bookingsData] = await Promise.all([
        getLabDashboardStats().catch(() => null),
        getLaboratories().catch(() => []),
        getEquipment().catch(() => []),
        getInventory().catch(() => []),
        getBookings().catch(() => [])
      ]);

      setStats(statsData);
      setLabs(labsData);
      setEquipment(eqData);
      setInventory(invData);
      setBookings(bookingsData);
    } catch (err: any) {
      setToast({ open: true, message: 'Failed to load lab data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered lists
  const filteredLabs = useMemo(() => {
    return labs.filter(
      (l) =>
        l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.labType?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [labs, searchQuery]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(
      (e) =>
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.laboratoryName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [equipment, searchQuery]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(
      (i) =>
        i.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.laboratoryName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.laboratoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.requestedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookings, searchQuery]);

  // Handle Lab Submit
  const handleLabSubmit = async () => {
    try {
      setSubmitting(true);
      if (labModal.isEdit) {
        const updated = await updateLaboratory(labModal.data._id, labModal.data);
        setLabs((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
        setToast({ open: true, message: 'Laboratory updated successfully', severity: 'success' });
      } else {
        const created = await createLaboratory(labModal.data);
        setLabs((prev) => [created, ...prev]);
        setToast({ open: true, message: 'Laboratory created successfully', severity: 'success' });
      }
      setLabModal({ open: false, isEdit: false, data: {} });
      // Refresh stats
      getLabDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to save laboratory',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Equipment Submit
  const handleEquipmentSubmit = async () => {
    try {
      setSubmitting(true);
      // Auto attach lab name if selected
      const selectedLab = labs.find((l) => l._id === eqModal.data.laboratoryId);
      const payload = {
        ...eqModal.data,
        laboratoryName: selectedLab ? selectedLab.name : eqModal.data.laboratoryName
      };

      if (eqModal.isEdit) {
        const updated = await updateEquipment(eqModal.data._id, payload);
        setEquipment((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
        setToast({ open: true, message: 'Equipment updated successfully', severity: 'success' });
      } else {
        const created = await createEquipment(payload);
        setEquipment((prev) => [created, ...prev]);
        setToast({ open: true, message: 'Equipment registered successfully', severity: 'success' });
      }
      setEqModal({ open: false, isEdit: false, data: {} });
      getLabDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to save equipment',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Inventory Submit
  const handleInventorySubmit = async () => {
    try {
      setSubmitting(true);
      const selectedLab = labs.find((l) => l._id === invModal.data.laboratoryId);
      const payload = {
        ...invModal.data,
        laboratoryName: selectedLab ? selectedLab.name : invModal.data.laboratoryName
      };

      if (invModal.isEdit) {
        const updated = await updateInventory(invModal.data._id, payload);
        setInventory((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
        setToast({ open: true, message: 'Consumable item updated successfully', severity: 'success' });
      } else {
        const created = await createInventory(payload);
        setInventory((prev) => [created, ...prev]);
        setToast({ open: true, message: 'Consumable item added successfully', severity: 'success' });
      }
      setInvModal({ open: false, isEdit: false, data: {} });
      getLabDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to save inventory item',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Booking Submit
  const handleBookingSubmit = async () => {
    try {
      setSubmitting(true);
      const selectedLab = labs.find((l) => l._id === bookingModal.data.laboratoryId);
      const payload = {
        ...bookingModal.data,
        laboratoryName: selectedLab ? selectedLab.name : bookingModal.data.laboratoryName
      };

      if (bookingModal.isEdit) {
        const updated = await updateBooking(bookingModal.data._id, payload);
        setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
        setToast({ open: true, message: 'Booking reservation updated', severity: 'success' });
      } else {
        const created = await createBooking(payload);
        setBookings((prev) => [created, ...prev]);
        setToast({ open: true, message: 'Lab booking requested successfully', severity: 'success' });
      }
      setBookingModal({ open: false, isEdit: false, data: {} });
      getLabDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to submit booking',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Deletion Confirmation
  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      if (deleteDialog.type === 'LAB') {
        await deleteLaboratory(deleteDialog.id);
        setLabs((prev) => prev.filter((l) => l._id !== deleteDialog.id));
        setToast({ open: true, message: 'Laboratory deleted successfully', severity: 'success' });
      } else if (deleteDialog.type === 'EQUIPMENT') {
        await deleteEquipment(deleteDialog.id);
        setEquipment((prev) => prev.filter((e) => e._id !== deleteDialog.id));
        setToast({ open: true, message: 'Equipment deleted successfully', severity: 'success' });
      } else if (deleteDialog.type === 'INVENTORY') {
        await deleteInventory(deleteDialog.id);
        setInventory((prev) => prev.filter((i) => i._id !== deleteDialog.id));
        setToast({ open: true, message: 'Inventory item deleted successfully', severity: 'success' });
      } else if (deleteDialog.type === 'BOOKING') {
        await deleteBooking(deleteDialog.id);
        setBookings((prev) => prev.filter((b) => b._id !== deleteDialog.id));
        setToast({ open: true, message: 'Booking deleted successfully', severity: 'success' });
      }
      setDeleteDialog({ open: false, type: 'LAB', id: '', title: '' });
      getLabDashboardStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to delete record',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body1" color="text.secondary">Loading Laboratory Intelligence Platform...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1440, mx: 'auto' }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ScienceIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
              Laboratories & Research
            </Typography>
            <Chip label="Real-time CRUD" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Centralized laboratory registry, high-value equipment management, consumable stock control, and automated reservations.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              if (activeTab === 0) setLabModal({ open: true, isEdit: false, data: { status: 'ACTIVE', capacity: 30, labType: 'COMPUTER' } });
              else if (activeTab === 1) setEqModal({ open: true, isEdit: false, data: { status: 'AVAILABLE', condition: 'GOOD', quantity: 1, category: 'COMPUTING' } });
              else if (activeTab === 2) setInvModal({ open: true, isEdit: false, data: { status: 'IN_STOCK', quantity: 10, minimumThreshold: 5, category: 'CHEMICALS', unit: 'Pcs' } });
              else setBookingModal({ open: true, isEdit: false, data: { status: 'PENDING', bookingDate: new Date().toISOString().split('T')[0] } });
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(25, 118, 210, 0.35)',
              px: 3
            }}
          >
            {activeTab === 0 && 'New Laboratory'}
            {activeTab === 1 && 'Register Equipment'}
            {activeTab === 2 && 'Add Consumable'}
            {activeTab === 3 && 'Request Booking'}
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Laboratories</Typography>
                  <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ my: 0.5 }}>
                    {stats?.totalLabs || labs.length}
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight={700}>
                    {stats?.activeLabs || labs.filter((l) => l.status === 'ACTIVE').length} Operational Labs
                  </Typography>
                </Box>
                <MeetingRoomIcon sx={{ fontSize: 40, color: 'primary.light' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #f3fdf8 0%, #ffffff 100%)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Equipment Units</Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#0d9488', my: 0.5 }}>
                    {equipment.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Across {equipment.length} registered models
                  </Typography>
                </Box>
                <ComputerIcon sx={{ fontSize: 40, color: '#14b8a6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Consumables & Stock</Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#d97706', my: 0.5 }}>
                    {inventory.length}
                  </Typography>
                  <Typography variant="caption" color="warning.main" fontWeight={700}>
                    {inventory.filter((i) => i.quantity <= i.minimumThreshold).length} Low Stock Alerts
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Active Bookings</Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#7c3aed', my: 0.5 }}>
                    {bookings.filter((b) => b.status === 'APPROVED' || b.status === 'PENDING').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {bookings.filter((b) => b.status === 'PENDING').length} Awaiting Approval
                  </Typography>
                </Box>
                <EventAvailableIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs Card */}
      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.95rem',
                minHeight: 52
              }
            }}
          >
            <Tab icon={<ScienceIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={`Laboratories (${labs.length})`} />
            <Tab icon={<ComputerIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={`Equipment (${equipment.length})`} />
            <Tab icon={<InventoryIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={`Consumables & Inventory (${inventory.length})`} />
            <Tab icon={<EventAvailableIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={`Bookings & Schedule (${bookings.length})`} />
            <Tab icon={<EventAvailableIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label="Session Attendance & Penalties" />
            <Tab icon={<DescriptionIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label="Practical Observations & Manuals" />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 260, my: 1 }}
          />
        </Box>

        {/* TAB 0: LABORATORIES */}
        {activeTab === 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Lab Code & Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location / Room</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>In-Charge</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLabs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No laboratories found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLabs.map((lab) => (
                    <TableRow key={lab._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main', display: 'flex' }}>
                            <ScienceIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{lab.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{lab.code}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lab.labType || 'GENERAL'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: lab.labType === 'COMPUTER' ? '#e0f2fe' : lab.labType === 'CHEMISTRY' ? '#fef3c7' : lab.labType === 'PHYSICS' ? '#ede9fe' : '#f1f5f9',
                            color: lab.labType === 'COMPUTER' ? '#0369a1' : lab.labType === 'CHEMISTRY' ? '#b45309' : lab.labType === 'PHYSICS' ? '#6d28d9' : '#334155'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{lab.capacity || 30} Students</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{lab.location || lab.roomNumber || 'Building 2'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{lab.inChargeName || 'Not Assigned'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lab.status}
                          size="small"
                          color={lab.status === 'ACTIVE' ? 'success' : lab.status === 'UNDER_MAINTENANCE' ? 'warning' : 'default'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Lab">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setLabModal({ open: true, isEdit: true, data: { ...lab } })}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Lab">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, type: 'LAB', id: lab._id, title: lab.name })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 1: EQUIPMENT */}
        {activeTab === 1 && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Asset Code & Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Laboratory</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Condition</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Operational Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No equipment records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((eq) => (
                    <TableRow key={eq._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#f0fdf4', color: '#16a34a', display: 'flex' }}>
                            <ComputerIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{eq.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {eq.code} • {eq.manufacturer || 'Standard'} {eq.modelNumber && `(${eq.modelNumber})`}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{eq.laboratoryName || 'General Lab'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={eq.category || 'OTHER'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{eq.quantity || 1} units</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={eq.condition || 'GOOD'}
                          size="small"
                          color={eq.condition === 'EXCELLENT' || eq.condition === 'GOOD' ? 'success' : 'warning'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={eq.status || 'AVAILABLE'}
                          size="small"
                          color={eq.status === 'AVAILABLE' ? 'primary' : eq.status === 'IN_USE' ? 'info' : 'error'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Equipment">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setEqModal({ open: true, isEdit: true, data: { ...eq } })}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Equipment">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, type: 'EQUIPMENT', id: eq._id, title: eq.name })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 2: INVENTORY */}
        {activeTab === 2 && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Item Code & Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Laboratory</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Stock Level</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Min Threshold</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Storage Location</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No consumable items or chemical inventory registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const isLow = item.quantity <= item.minimumThreshold;
                    return (
                      <TableRow key={item._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: isLow ? '#fef2f2' : '#fffbeb', color: isLow ? '#dc2626' : '#d97706', display: 'flex' }}>
                              {isLow ? <WarningAmberIcon fontSize="small" /> : <InventoryIcon fontSize="small" />}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700}>{item.itemName}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.itemCode}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.laboratoryName || 'Central Lab'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={item.category || 'CHEMICALS'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={700} color={isLow ? 'error.main' : 'text.primary'}>
                              {item.quantity} {item.unit || 'units'}
                            </Typography>
                            {isLow && <Chip label="LOW" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />}
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (item.quantity / (item.minimumThreshold * 2 || 10)) * 100)}
                            color={isLow ? 'error' : 'success'}
                            sx={{ height: 4, borderRadius: 2, mt: 0.5, maxWidth: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{item.minimumThreshold} {item.unit || 'units'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.storageLocation || 'Storage Rack'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Consumable">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => setInvModal({ open: true, isEdit: true, data: { ...item } })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Consumable">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, type: 'INVENTORY', id: item._id, title: item.itemName })}
                            >
                              <DeleteIcon fontSize="small" />
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
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === 3 && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Laboratory</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Requested By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Slot</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Approver</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No lab booking requests recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((bk) => (
                    <TableRow key={bk._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={700}>{bk.laboratoryName || 'Laboratory'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{bk.requestedByName || 'Faculty Member'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {bk.bookingDate ? new Date(bk.bookingDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bk.startTime} - {bk.endTime}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {bk.purpose || 'Practical Session'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bk.status || 'PENDING'}
                          size="small"
                          color={bk.status === 'APPROVED' ? 'success' : bk.status === 'PENDING' ? 'warning' : 'error'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {bk.approvedByName || (bk.status === 'APPROVED' ? 'System Admin' : 'Pending')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {bk.status === 'PENDING' && (
                          <>
                            <Tooltip title="Approve Request">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={async () => {
                                  try {
                                    const updated = await updateBooking(bk._id, { status: 'APPROVED', approvedByName: 'Admin' });
                                    setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
                                    setToast({ open: true, message: 'Booking approved successfully', severity: 'success' });
                                  } catch (e) {
                                    setToast({ open: true, message: 'Failed to approve booking', severity: 'error' });
                                  }
                                }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Request">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={async () => {
                                  try {
                                    const updated = await updateBooking(bk._id, { status: 'REJECTED' });
                                    setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
                                    setToast({ open: true, message: 'Booking rejected', severity: 'success' });
                                  } catch (e) {
                                    setToast({ open: true, message: 'Failed to reject booking', severity: 'error' });
                                  }
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Edit Booking">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setBookingModal({ open: true, isEdit: true, data: { ...bk } })}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Booking">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, type: 'BOOKING', id: bk._id, title: `${bk.laboratoryName} (${bk.bookingDate})` })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 4: SESSION ATTENDANCE & APPARATUS PENALTIES */}
        {activeTab === 4 && (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <LabSessionAttendanceDesk />
          </Box>
        )}

        {/* TAB 5: PRACTICAL OBSERVATIONS & MANUALS */}
        {activeTab === 5 && (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <LabObservationsDesk />
          </Box>
        )}
      </Card>

      {/* ================= MODAL: LABORATORY CREATE / EDIT ================= */}
      <Dialog
        open={labModal.open}
        onClose={() => setLabModal({ open: false, isEdit: false, data: {} })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {labModal.isEdit ? 'Edit Laboratory' : 'Add New Laboratory'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Laboratory Name"
            required
            fullWidth
            value={labModal.data.name || ''}
            onChange={(e) => setLabModal({ ...labModal, data: { ...labModal.data, name: e.target.value } })}
            placeholder="e.g. Advanced AI & Robotics Lab"
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label="Lab Specialization"
                required
                fullWidth
                value={labModal.data.labType || 'COMPUTER'}
                onChange={(e) => setLabModal({ ...labModal, data: { ...labModal.data, labType: e.target.value } })}
              >
                {LAB_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Student Capacity"
                required
                fullWidth
                value={labModal.data.capacity || 30}
                onChange={(e) => setLabModal({ ...labModal, data: { ...labModal.data, capacity: Number(e.target.value) } })}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Location / Room No."
                fullWidth
                value={labModal.data.location || ''}
                onChange={(e) => setLabModal({ ...labModal, data: { ...labModal.data, location: e.target.value } })}
                placeholder="e.g. Science Block, Room 204"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Status"
                fullWidth
                value={labModal.data.status || 'ACTIVE'}
                onChange={(e) => setLabModal({ ...labModal, data: { ...labModal.data, status: e.target.value } })}
              >
                {LAB_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <TextField
            label="Lab In-Charge Faculty Name"
            fullWidth
            value={labModal.data.inChargeName || ''}
            onChange={(e) => setLabModal({ ...labModal, data: { ...labModal.data, inChargeName: e.target.value } })}
            placeholder="e.g. Prof. Rajesh Sharma"
          />

          <TextField
            label="Safety Protocols & Guidelines"
            multiline
            rows={2}
            fullWidth
            value={labModal.data.safetyGuidelines || ''}
            onChange={(e) => setLabModal({ ...labModal, data: { ...labModal.data, safetyGuidelines: e.target.value } })}
            placeholder="Safety goggles required, emergency shower at entrance..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLabModal({ open: false, isEdit: false, data: {} })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleLabSubmit}
            disabled={submitting || !labModal.data.name}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} /> : labModal.isEdit ? 'Save Changes' : 'Create Laboratory'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: EQUIPMENT CREATE / EDIT ================= */}
      <Dialog
        open={eqModal.open}
        onClose={() => setEqModal({ open: false, isEdit: false, data: {} })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {eqModal.isEdit ? 'Edit Equipment' : 'Register Lab Equipment'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Equipment / Instrument Name"
            required
            fullWidth
            value={eqModal.data.name || ''}
            onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, name: e.target.value } })}
            placeholder="e.g. Digital Storage Oscilloscope 100MHz"
          />

          <TextField
            select
            label="Assign to Laboratory"
            required
            fullWidth
            value={eqModal.data.laboratoryId || ''}
            onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, laboratoryId: e.target.value } })}
          >
            {labs.map((l) => (
              <MenuItem key={l._id} value={l._id}>{l.name} ({l.code})</MenuItem>
            ))}
          </TextField>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label="Category"
                fullWidth
                value={eqModal.data.category || 'COMPUTING'}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, category: e.target.value } })}
              >
                {EQ_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Quantity Units"
                fullWidth
                value={eqModal.data.quantity || 1}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, quantity: Number(e.target.value) } })}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Manufacturer / Brand"
                fullWidth
                value={eqModal.data.manufacturer || ''}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, manufacturer: e.target.value } })}
                placeholder="e.g. Tektronix / Dell"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Model / Serial Number"
                fullWidth
                value={eqModal.data.modelNumber || ''}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, modelNumber: e.target.value } })}
                placeholder="e.g. TDS-2024C"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label="Physical Condition"
                fullWidth
                value={eqModal.data.condition || 'GOOD'}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, condition: e.target.value } })}
              >
                {EQ_CONDITIONS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Operational Status"
                fullWidth
                value={eqModal.data.status || 'AVAILABLE'}
                onChange={(e) => setEqModal({ ...eqModal, data: { ...eqModal.data, status: e.target.value } })}
              >
                {EQ_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEqModal({ open: false, isEdit: false, data: {} })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEquipmentSubmit}
            disabled={submitting || !eqModal.data.name || !eqModal.data.laboratoryId}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} /> : eqModal.isEdit ? 'Save Changes' : 'Register Equipment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: INVENTORY CREATE / EDIT ================= */}
      <Dialog
        open={invModal.open}
        onClose={() => setInvModal({ open: false, isEdit: false, data: {} })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {invModal.isEdit ? 'Edit Consumable' : 'Add Lab Consumable / Reagent'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Item / Chemical Name"
            required
            fullWidth
            value={invModal.data.itemName || ''}
            onChange={(e) => setInvModal({ ...invModal, data: { ...invModal.data, itemName: e.target.value } })}
            placeholder="e.g. Ethanol 99.9% Molecular Grade"
          />

          <TextField
            select
            label="Lab Allocation"
            required
            fullWidth
            value={invModal.data.laboratoryId || ''}
            onChange={(e) => setInvModal({ ...invModal, data: { ...invModal.data, laboratoryId: e.target.value } })}
          >
            {labs.map((l) => (
              <MenuItem key={l._id} value={l._id}>{l.name} ({l.code})</MenuItem>
            ))}
          </TextField>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                label="Category"
                fullWidth
                value={invModal.data.category || 'CHEMICALS'}
                onChange={(e) => setInvModal({ ...invModal, data: { ...invModal.data, category: e.target.value } })}
              >
                {INV_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Unit of Measurement"
                fullWidth
                value={invModal.data.unit || 'Liters'}
                onChange={(e) => setInvModal({ ...invModal, data: { ...invModal.data, unit: e.target.value } })}
                placeholder="e.g. Liters, Grams, Pcs, Boxes"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Current Stock Quantity"
                fullWidth
                value={invModal.data.quantity || 0}
                onChange={(e) => setInvModal({ ...invModal, data: { ...invModal.data, quantity: Number(e.target.value) } })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Low Stock Alert Threshold"
                fullWidth
                value={invModal.data.minimumThreshold || 5}
                onChange={(e) => setInvModal({ ...invModal, data: { ...invModal.data, minimumThreshold: Number(e.target.value) } })}
              />
            </Grid>
          </Grid>

          <TextField
            label="Storage Cabinet / Shelf Location"
            fullWidth
            value={invModal.data.storageLocation || ''}
            onChange={(e) => setInvModal({ ...invModal, data: { ...invModal.data, storageLocation: e.target.value } })}
            placeholder="e.g. Flameproof Cabinet B, Shelf 3"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInvModal({ open: false, isEdit: false, data: {} })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInventorySubmit}
            disabled={submitting || !invModal.data.itemName || !invModal.data.laboratoryId}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} /> : invModal.isEdit ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: BOOKING CREATE / EDIT ================= */}
      <Dialog
        open={bookingModal.open}
        onClose={() => setBookingModal({ open: false, isEdit: false, data: {} })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {bookingModal.isEdit ? 'Edit Lab Booking' : 'Request Lab Booking'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            select
            label="Target Laboratory"
            required
            fullWidth
            value={bookingModal.data.laboratoryId || ''}
            onChange={(e) => setBookingModal({ ...bookingModal, data: { ...bookingModal.data, laboratoryId: e.target.value } })}
          >
            {labs.map((l) => (
              <MenuItem key={l._id} value={l._id}>{l.name} ({l.code})</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Faculty / Requester Name"
            required
            fullWidth
            value={bookingModal.data.requestedByName || ''}
            onChange={(e) => setBookingModal({ ...bookingModal, data: { ...bookingModal.data, requestedByName: e.target.value } })}
            placeholder="e.g. Dr. Arvind Saxena"
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Booking Date"
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
                value={bookingModal.data.bookingDate ? new Date(bookingModal.data.bookingDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setBookingModal({ ...bookingModal, data: { ...bookingModal.data, bookingDate: e.target.value } })}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Start Time"
                fullWidth
                value={bookingModal.data.startTime || '10:00 AM'}
                onChange={(e) => setBookingModal({ ...bookingModal, data: { ...bookingModal.data, startTime: e.target.value } })}
                placeholder="10:00 AM"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="End Time"
                fullWidth
                value={bookingModal.data.endTime || '11:30 AM'}
                onChange={(e) => setBookingModal({ ...bookingModal, data: { ...bookingModal.data, endTime: e.target.value } })}
                placeholder="11:30 AM"
              />
            </Grid>
          </Grid>

          <TextField
            label="Experiment Purpose / Topic"
            required
            multiline
            rows={2}
            fullWidth
            value={bookingModal.data.purpose || ''}
            onChange={(e) => setBookingModal({ ...bookingModal, data: { ...bookingModal.data, purpose: e.target.value } })}
            placeholder="e.g. Class 11 Optics Practical and Laser Diffraction"
          />

          <TextField
            select
            label="Reservation Status"
            fullWidth
            value={bookingModal.data.status || 'PENDING'}
            onChange={(e) => setBookingModal({ ...bookingModal, data: { ...bookingModal.data, status: e.target.value } })}
          >
            {BOOKING_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBookingModal({ open: false, isEdit: false, data: {} })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBookingSubmit}
            disabled={submitting || !bookingModal.data.laboratoryId || !bookingModal.data.purpose}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} /> : bookingModal.isEdit ? 'Save Changes' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: 'LAB', id: '', title: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{deleteDialog.title}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone and will remove all associated records from the active register.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, type: 'LAB', id: '', title: '' })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={submitting}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= SNACKBAR NOTIFICATIONS ================= */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LabDashboard;
