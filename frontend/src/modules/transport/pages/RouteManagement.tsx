import React, { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  LocationOn as PinIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  People as StudentIcon,
  DirectionsBus as BusIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as OkIcon
} from '@mui/icons-material';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, CircularProgress, Chip,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import api from '../../../core/api/axios';

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStops, setLoadingStops] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modal States
  const [openRouteModal, setOpenRouteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [routeForm, setRouteForm] = useState({
    name: '',
    code: '',
    startPoint: '',
    endPoint: '',
    estimatedDurationMinutes: 45,
    distanceKm: 12,
    defaultVehicleId: '',
    defaultDriverId: '',
    status: 'ACTIVE'
  });

  // Stop Modal
  const [openStopModal, setOpenStopModal] = useState(false);
  const [stopForm, setStopForm] = useState({
    name: '',
    sequence: 1,
    pickupTime: '07:30',
    dropoffTime: '15:30',
    landmark: ''
  });

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transport/routes');
      const d = res.data.data;
      const list = Array.isArray(d) ? d : (d?.data || []);
      setRoutes(list);
      if (list.length > 0) {
        if (!selectedRoute || !list.find(r => r._id === selectedRoute._id)) {
          setSelectedRoute(list[0]);
          fetchStops(list[0]._id);
        } else {
          fetchStops(selectedRoute._id);
        }
      } else {
        setSelectedRoute(null);
        setStops([]);
      }
    } catch (e: any) {
      console.error('Failed to load routes', e);
      setAlert({ type: 'error', msg: 'Failed to load transport routes' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [vRes, sRes] = await Promise.all([
        api.get('/transport/vehicles').catch(() => ({ data: { data: [] } })),
        api.get('/transport/staff').catch(() => ({ data: { data: [] } }))
      ]);
      const vList = Array.isArray(vRes.data.data) ? vRes.data.data : (vRes.data.data?.data || []);
      const sList = Array.isArray(sRes.data.data) ? sRes.data.data : (sRes.data.data?.data || []);
      setVehicles(vList);
      setStaff(sList);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStops = async (routeId: string) => {
    setLoadingStops(true);
    try {
      const res = await api.get(`/transport/routes/${routeId}/stops`);
      const d = res.data.data;
      setStops(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error(e);
      setStops([]);
    } finally {
      setLoadingStops(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchAuxData();
  }, []);

  const handleSelectRoute = (r: any) => {
    setSelectedRoute(r);
    fetchStops(r._id);
  };

  const handleOpenCreateRoute = () => {
    setIsEditing(false);
    setRouteForm({
      name: '',
      code: `RT-${routes.length + 1}`.padStart(5, '0'),
      startPoint: '',
      endPoint: 'School Campus',
      estimatedDurationMinutes: 45,
      distanceKm: 10,
      defaultVehicleId: vehicles[0]?._id || '',
      defaultDriverId: staff[0]?._id || '',
      status: 'ACTIVE'
    });
    setOpenRouteModal(true);
  };

  const handleOpenEditRoute = (r: any) => {
    setIsEditing(true);
    setRouteForm({
      name: r.name,
      code: r.code,
      startPoint: r.startPoint,
      endPoint: r.endPoint,
      estimatedDurationMinutes: r.estimatedDurationMinutes || 45,
      distanceKm: r.distanceKm || 10,
      defaultVehicleId: r.defaultVehicleId?._id || r.defaultVehicleId || '',
      defaultDriverId: r.defaultDriverId?._id || r.defaultDriverId || '',
      status: r.status || 'ACTIVE'
    });
    setOpenRouteModal(true);
  };

  const handleSaveRoute = async () => {
    if (!routeForm.name || !routeForm.code || !routeForm.startPoint || !routeForm.endPoint) {
      setAlert({ type: 'error', msg: 'Name, code, start point, and end point are required' });
      return;
    }
    setSaving(true);
    try {
      if (isEditing && selectedRoute) {
        await api.patch(`/transport/routes/${selectedRoute._id}`, routeForm);
        setAlert({ type: 'success', msg: 'Route updated successfully!' });
      } else {
        await api.post('/transport/routes', routeForm);
        setAlert({ type: 'success', msg: 'Route created successfully!' });
      }
      setOpenRouteModal(false);
      fetchRoutes();
    } catch (e: any) {
      console.error(e);
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to save route' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await api.delete(`/transport/routes/${routeId}`);
      setAlert({ type: 'success', msg: 'Route deleted successfully.' });
      fetchRoutes();
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to delete route' });
    }
  };

  const handleOpenAddStop = () => {
    if (!selectedRoute) return;
    setStopForm({
      name: '',
      sequence: (stops.length || 0) + 1,
      pickupTime: '07:30',
      dropoffTime: '15:30',
      landmark: ''
    });
    setOpenStopModal(true);
  };

  const handleSaveStop = async () => {
    if (!selectedRoute) return;
    if (!stopForm.name) {
      alert('Stop name is required');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/transport/routes/${selectedRoute._id}/stops`, stopForm);
      setAlert({ type: 'success', msg: 'Route stop added successfully!' });
      setOpenStopModal(false);
      fetchStops(selectedRoute._id);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to add stop');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!selectedRoute || !window.confirm('Delete this stop?')) return;
    try {
      await api.delete(`/transport/routes/${selectedRoute._id}/stops/${stopId}`);
      fetchStops(selectedRoute._id);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to delete stop');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <BusIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Route & Fleet Management</h1>
            <p className="text-sm text-gray-500">Create, monitor, and optimize institution transport routes and stops.</p>
          </div>
        </div>
        <button 
          onClick={handleOpenCreateRoute}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <AddIcon style={{ fontSize: 18 }} /> Create Route
        </button>
      </div>

      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ borderRadius: 2 }}>
          {alert.msg}
        </Alert>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100">
          <CircularProgress size={36} sx={{ color: '#2563eb' }} />
          <p className="text-sm text-gray-500">Loading routes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Routes List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">All Routes ({routes.length})</h2>
            </div>

            {routes.map(route => {
              const isSelected = selectedRoute?._id === route._id;
              const vehicleNum = route.defaultVehicleId?.vehicleNumber || route.defaultVehicleId?.registrationNumber || 'Unassigned';
              const driverName = route.defaultDriverId ? `${route.defaultDriverId.firstName || ''} ${route.defaultDriverId.lastName || ''}`.trim() : 'Unassigned';

              return (
                <div 
                  key={route._id} 
                  onClick={() => handleSelectRoute(route)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-100 scale-[1.01]' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      route.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {route.status || 'Active'}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">{route.code}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{route.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{route.startPoint} &rarr; {route.endPoint}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Vehicle</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{vehicleNum}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Driver</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{driverName}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {routes.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                <BusIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                <p className="text-sm font-semibold">No routes created yet.</p>
                <p className="text-xs mt-1">Click "+ Create Route" to define your first bus route.</p>
              </div>
            )}
          </div>

          {/* Right Selected Route Details & Stops */}
          <div className="lg:col-span-2">
            {selectedRoute ? (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold mb-2 inline-block">
                        {selectedRoute.code}
                      </span>
                      <h2 className="text-2xl font-black">{selectedRoute.name}</h2>
                      <p className="text-blue-100 text-xs mt-1">
                        {selectedRoute.startPoint} &rarr; {selectedRoute.endPoint}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEditRoute(selectedRoute)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition text-white"
                        title="Edit Route"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button 
                        onClick={() => handleDeleteRoute(selectedRoute._id)}
                        className="p-2 bg-white/20 hover:bg-red-500 rounded-xl transition text-white"
                        title="Delete Route"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-6 mt-4 text-xs font-medium text-white/90">
                    <span className="flex items-center gap-1.5"><TimeIcon fontSize="small" /> {selectedRoute.estimatedDurationMinutes || 45} mins</span>
                    <span className="flex items-center gap-1.5"><MapIcon fontSize="small" /> {selectedRoute.distanceKm || 10} km</span>
                    <span className="flex items-center gap-1.5"><BusIcon fontSize="small" /> {selectedRoute.defaultVehicleId?.vehicleNumber || 'Vehicle Assigned'}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <PinIcon className="text-blue-600" /> Route Stops & Boarding Points ({stops.length})
                    </h3>
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<AddIcon />} 
                      onClick={handleOpenAddStop}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      Add Stop
                    </Button>
                  </div>

                  {loadingStops ? (
                    <div className="py-12 flex justify-center"><CircularProgress size={28} /></div>
                  ) : stops.length > 0 ? (
                    <div className="space-y-4">
                      {stops.map((stop, idx) => (
                        <div key={stop._id || idx} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center hover:border-blue-300 transition">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {stop.sequence || idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{stop.name}</p>
                              {stop.landmark && <p className="text-xs text-gray-400">{stop.landmark}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                                Pickup: {stop.pickupTime}
                              </span>
                              {stop.dropoffTime && (
                                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md ml-2">
                                  Drop: {stop.dropoffTime}
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => handleDeleteStop(stop._id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                              title="Delete Stop"
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                      <PinIcon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }} />
                      <p className="text-sm font-semibold">No stops configured for this route.</p>
                      <p className="text-xs mt-1">Click "Add Stop" to create boarding points with pickup times.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300 p-8 text-gray-400">
                <BusIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                <p className="font-bold text-gray-600">No Route Selected</p>
                <p className="text-xs text-gray-400">Select a route on the left or create a new route.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROUTE DIALOG */}
      <Dialog 
        open={openRouteModal} 
        onClose={() => setOpenRouteModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEditing ? 'Edit Route' : 'Create New Route'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField 
            label="Route Name" 
            fullWidth 
            required 
            placeholder="e.g., North Campus - Morning" 
            value={routeForm.name} 
            onChange={e => setRouteForm({ ...routeForm, name: e.target.value })} 
          />
          <TextField 
            label="Route Code" 
            fullWidth 
            required 
            placeholder="e.g., RT-01" 
            value={routeForm.code} 
            onChange={e => setRouteForm({ ...routeForm, code: e.target.value })} 
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField 
              label="Start Point / Origin" 
              fullWidth 
              required 
              placeholder="e.g., Central Station" 
              value={routeForm.startPoint} 
              onChange={e => setRouteForm({ ...routeForm, startPoint: e.target.value })} 
            />
            <TextField 
              label="End Point / Destination" 
              fullWidth 
              required 
              placeholder="e.g., Main School Gate" 
              value={routeForm.endPoint} 
              onChange={e => setRouteForm({ ...routeForm, endPoint: e.target.value })} 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField 
              label="Est. Duration (Minutes)" 
              type="number" 
              fullWidth 
              value={routeForm.estimatedDurationMinutes} 
              onChange={e => setRouteForm({ ...routeForm, estimatedDurationMinutes: Number(e.target.value) })} 
            />
            <TextField 
              label="Distance (km)" 
              type="number" 
              fullWidth 
              value={routeForm.distanceKm} 
              onChange={e => setRouteForm({ ...routeForm, distanceKm: Number(e.target.value) })} 
            />
          </div>

          <FormControl fullWidth>
            <InputLabel>Assign Vehicle</InputLabel>
            <Select 
              value={routeForm.defaultVehicleId} 
              label="Assign Vehicle" 
              onChange={e => setRouteForm({ ...routeForm, defaultVehicleId: e.target.value })}
            >
              <MenuItem value=""><em>None / Unassigned</em></MenuItem>
              {vehicles.map(v => (
                <MenuItem key={v._id} value={v._id}>
                  {v.vehicleNumber || v.registrationNumber} ({v.type || 'Bus'} - Cap: {v.seatingCapacity || 30})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Assign Driver</InputLabel>
            <Select 
              value={routeForm.defaultDriverId} 
              label="Assign Driver" 
              onChange={e => setRouteForm({ ...routeForm, defaultDriverId: e.target.value })}
            >
              <MenuItem value=""><em>None / Unassigned</em></MenuItem>
              {staff.map(s => (
                <MenuItem key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.role || 'Driver'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRouteModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRoute} disabled={saving} sx={{ fontWeight: 700 }}>
            {saving ? 'Saving...' : (isEditing ? 'Update Route' : 'Create Route')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD STOP DIALOG */}
      <Dialog 
        open={openStopModal} 
        onClose={() => setOpenStopModal(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Add Boarding Stop</DialogTitle>
        <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Stop Name / Location" 
            fullWidth 
            required 
            placeholder="e.g., Metro Station Junction" 
            value={stopForm.name} 
            onChange={e => setStopForm({ ...stopForm, name: e.target.value })} 
          />
          <TextField 
            label="Stop Order Sequence" 
            type="number" 
            fullWidth 
            required 
            value={stopForm.sequence} 
            onChange={e => setStopForm({ ...stopForm, sequence: Number(e.target.value) })} 
          />
          <div className="grid grid-cols-2 gap-2">
            <TextField 
              label="Pickup Time" 
              fullWidth 
              value={stopForm.pickupTime} 
              onChange={e => setStopForm({ ...stopForm, pickupTime: e.target.value })} 
            />
            <TextField 
              label="Dropoff Time" 
              fullWidth 
              value={stopForm.dropoffTime} 
              onChange={e => setStopForm({ ...stopForm, dropoffTime: e.target.value })} 
            />
          </div>
          <TextField 
            label="Landmark (Optional)" 
            fullWidth 
            value={stopForm.landmark} 
            onChange={e => setStopForm({ ...stopForm, landmark: e.target.value })} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenStopModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStop} disabled={saving} sx={{ fontWeight: 700 }}>
            {saving ? 'Adding...' : 'Add Stop'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RouteManagement;
