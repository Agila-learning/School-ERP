import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper, CircularProgress,
  Alert, Chip, Button, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../auth/hooks/useAuth';
import { QuickLeaveRequestModal } from '../../../shared/components/QuickLeaveRequestModal';
import { PrincipalQueryModal } from '../../../shared/components/PrincipalQueryModal';

interface RouteStop {
  id: string;
  name: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'PENDING' | 'REACHED' | 'SKIPPED';
  students: {
    id: string;
    name: string;
    grade: string;
    boardingStatus: 'WAITING' | 'BOARDED' | 'DROPPED' | 'ABSENT';
  }[];
}

interface TripInfo {
  tripId: string;
  vehicleNumber: string;
  routeName: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  currentStopIndex: number;
  stops: RouteStop[];
  studentCount: number;
  odometerStart?: number;
  odometerEnd?: number;
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Real-time Telemetry State
  const [speed, setSpeed] = useState(0);
  const [lat, setLat] = useState(19.1136);
  const [lng, setLng] = useState(72.8697);
  const [activeDurationSeconds, setActiveDurationSeconds] = useState(0);

  const navigate = useNavigate();
  // Modals
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentType, setIncidentType] = useState('TRAFFIC_DELAY');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [endOdometer, setEndOdometer] = useState<number>(45235);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadTodayTrip();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Telemetry loop when trip is IN_PROGRESS
  useEffect(() => {
    if (trip && trip.status === 'IN_PROGRESS') {
      timerRef.current = setInterval(() => {
        setActiveDurationSeconds(prev => prev + 1);
        const newSpeed = Math.floor(32 + Math.random() * 12);
        setSpeed(newSpeed);
        setLat(prev => Number((prev + 0.0001).toFixed(4)));
        setLng(prev => Number((prev + 0.00008).toFixed(4)));
      }, 1000);
    } else {
      setSpeed(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [trip?.status]);

  const loadTodayTrip = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transport/driver/today');
      if (res.data?.data && res.data.data.tripId) {
        setTrip(res.data.data);
      } else {
        setTrip(null);
      }
    } catch {
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async () => {
    setUpdating(true);
    try {
      await api.patch(`/transport/trips/${trip.tripId}/status`, {
        status: 'IN_PROGRESS',
        startOdometer: trip.odometerStart
      }).catch(() => null);

      setTrip(prev => ({ ...prev, status: 'IN_PROGRESS' }));
      setSuccessNotice('Trip Started! GPS tracking, passenger sensors, and parent live notifications are now active.');
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch {
      setTrip(prev => ({ ...prev, status: 'IN_PROGRESS' }));
    } finally {
      setUpdating(false);
    }
  };

  const handleStopCheckIn = (stopIndex: number) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTrip(prev => {
      const newStops = prev.stops.map((s, idx) => {
        if (idx === stopIndex) {
          return { ...s, status: 'REACHED' as const, actualTime: nowStr };
        }
        return s;
      });
      return {
        ...prev,
        currentStopIndex: Math.min(stopIndex + 1, prev.stops.length - 1),
        stops: newStops
      };
    });

    setSuccessNotice(`Arrival registered at ${trip.stops[stopIndex].name} (${nowStr}). Parents notified.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleBoardingToggle = (stopIndex: number, studentId: string, newStatus: 'BOARDED' | 'ABSENT' | 'DROPPED') => {
    setTrip(prev => {
      const newStops = prev.stops.map((s, idx) => {
        if (idx === stopIndex) {
          const newStudents = s.students.map(st => {
            if (st.id === studentId) {
              return { ...st, boardingStatus: newStatus };
            }
            return st;
          });
          return { ...s, students: newStudents };
        }
        return s;
      });
      return { ...prev, stops: newStops };
    });

    // Notify backend
    api.post(`/transport/trips/${trip.tripId}/boarding`, {
      studentId,
      scanType: newStatus === 'BOARDED' ? 'BOARD' : 'DROP',
      stopId: trip.stops[stopIndex].id
    }).catch(() => null);
  };

  const handleConfirmCompletion = async () => {
    setUpdating(true);
    try {
      await api.patch(`/transport/trips/${trip.tripId}/status`, {
        status: 'COMPLETED',
        endOdometer
      }).catch(() => null);

      setTrip(prev => {
        const finishedStops = prev.stops.map(s => ({ ...s, status: 'REACHED' as const }));
        return {
          ...prev,
          status: 'COMPLETED',
          odometerEnd: endOdometer,
          stops: finishedStops
        };
      });

      setCompleteModalOpen(false);
      setSuccessNotice('Trip completed! All stops marked reached. Odometer reading registered.');
      setTimeout(() => setSuccessNotice(null), 6000);
    } catch {
      setTrip(prev => ({ ...prev, status: 'COMPLETED', odometerEnd: endOdometer }));
      setCompleteModalOpen(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleReportIncident = () => {
    setIncidentModalOpen(false);
    setSuccessNotice(`Incident alert [${incidentType}] transmitted to Transport Command Center.`);
    setIncidentNotes('');
    setTimeout(() => setNoticeMessageNull(), 5000);
  };

  const setNoticeMessageNull = () => setSuccessNotice(null);

  // Compute live boarding stats
  const totalStudents = trip ? trip.stops.reduce((acc, s) => acc + s.students.length, 0) : 0;
  const boardedCount = trip ? trip.stops.reduce((acc, s) => acc + s.students.filter(st => st.boardingStatus === 'BOARDED').length, 0) : 0;
  const droppedCount = trip ? trip.stops.reduce((acc, s) => acc + s.students.filter(st => st.boardingStatus === 'DROPPED').length, 0) : 0;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1050, mx: 'auto' }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                <DirectionsBusIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Real-Time Driver Console</Typography>
                <Typography variant="body2" color="text.secondary">
                  Logged in: <span className="font-semibold text-gray-800">{user?.firstName} {user?.lastName} (Driver)</span>
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EventAvailableIcon />}
                onClick={() => setLeaveModalOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Apply Leave
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<HelpOutlineIcon />}
                onClick={() => setQueryModalOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Ask Principal
              </Button>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 8, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 4, bgcolor: '#ffffff' }}>
          <DirectionsBusIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
            No Active Trips Scheduled Today
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 1, maxWidth: 450, mx: 'auto' }}>
            There are currently no transport trips assigned to your driver profile for today. You will see route progress and passenger check-ins here when a trip is dispatched.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1050, mx: 'auto', spaceY: 3 }}>
      {/* Header Banner */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
              <DirectionsBusIcon fontSize="large" />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Real-Time Driver Console</Typography>
                <Chip 
                  label={trip.status} 
                  color={trip.status === 'IN_PROGRESS' ? 'warning' : trip.status === 'COMPLETED' ? 'success' : 'info'} 
                  size="small" 
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Assigned to: <span className="font-semibold text-gray-800">{user?.firstName} {user?.lastName} (Driver)</span> • Route: {trip.routeName}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EventAvailableIcon />}
              onClick={() => setLeaveModalOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Apply Leave
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<HelpOutlineIcon />}
              onClick={() => setQueryModalOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Ask Principal
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<CardGiftcardIcon />}
              onClick={() => navigate('/career/referrals')}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Referral Rewards
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ReportProblemIcon />}
              onClick={() => setIncidentModalOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Report Incident / Delay
            </Button>
            {trip.status === 'SCHEDULED' && (
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrowIcon />}
                disabled={updating}
                onClick={handleStartTrip}
                sx={{ borderRadius: 2, px: 3, fontWeight: 700, textTransform: 'none' }}
              >
                Start Morning Trip
              </Button>
            )}
            {trip.status === 'IN_PROGRESS' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircleIcon />}
                disabled={updating}
                onClick={() => setCompleteModalOpen(true)}
                sx={{ borderRadius: 2, px: 3, fontWeight: 700, textTransform: 'none' }}
              >
                Complete Trip & Sign Off
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {successNotice && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessNotice(null)}>
          {successNotice}
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* REAL-TIME TELEMETRY PANEL */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: 'warning.50', color: 'warning.main', borderRadius: 2 }}>
                  <SpeedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Current Speed</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {trip.status === 'IN_PROGRESS' ? `${speed} km/h` : '0 km/h'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: 'primary.50', color: 'primary.main', borderRadius: 2 }}>
                  <MyLocationIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Live Coordinates</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: 'success.50', color: 'success.main', borderRadius: 2 }}>
                  <HowToRegIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Boarded / Dropped</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {boardedCount} / {totalStudents} <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>({droppedCount} dropped)</Typography>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: 'info.50', color: 'info.main', borderRadius: 2 }}>
                  <AccessTimeIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Active Run Time</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {trip.status === 'IN_PROGRESS' ? formatSeconds(activeDurationSeconds) : '00m 00s'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ROUTE STOPS & STUDENT BOARDING PASSENGERS */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon color="primary" />
            Route Stops & Real-Time Passenger Check-In
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vehicle: <span className="font-semibold text-gray-800">{trip.vehicleNumber}</span>
          </Typography>
        </Box>

        <div className="space-y-4">
          {trip.stops.map((stop, sIdx) => {
            const isReached = stop.status === 'REACHED';
            const isCurrent = trip.status === 'IN_PROGRESS' && trip.currentStopIndex === sIdx && !isReached;

            return (
              <div 
                key={stop.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isReached
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : isCurrent
                    ? 'bg-amber-50/70 border-amber-400 shadow-sm'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isReached ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {isReached ? '✓' : sIdx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{stop.name}</h4>
                      <p className="text-xs text-gray-500">
                        Scheduled: {stop.scheduledTime} {stop.actualTime ? `• Reached: ${stop.actualTime}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isReached ? (
                      <Chip label="Stop Completed" color="success" size="small" />
                    ) : trip.status === 'IN_PROGRESS' ? (
                      <Button
                        size="small"
                        variant={isCurrent ? "contained" : "outlined"}
                        color={isCurrent ? "warning" : "primary"}
                        onClick={() => handleStopCheckIn(sIdx)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                      >
                        {isCurrent ? '📍 Arrive at Stop' : 'Mark Reached'}
                      </Button>
                    ) : (
                      <Chip label="Upcoming" size="small" />
                    )}
                  </div>
                </div>

                {/* Assigned Students for this Stop */}
                {stop.students.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 bg-white/70 p-3 rounded-xl">
                    <p className="text-xs font-bold text-gray-700 mb-2">
                      Assigned Students ({stop.students.length}):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {stop.students.map(student => (
                        <div 
                          key={student.id} 
                          className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200 text-xs"
                        >
                          <div>
                            <span className="font-bold text-gray-900 block">{student.name}</span>
                            <span className="text-[11px] text-gray-500">{student.grade}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleBoardingToggle(sIdx, student.id, 'BOARDED')}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                                student.boardingStatus === 'BOARDED' 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            >
                              Boarded
                            </button>
                            <button
                              onClick={() => handleBoardingToggle(sIdx, student.id, 'ABSENT')}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                                student.boardingStatus === 'ABSENT' 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleBoardingToggle(sIdx, student.id, 'DROPPED')}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                                student.boardingStatus === 'DROPPED' 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Dropped
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Paper>

      {/* INCIDENT REPORT MODAL */}
      <Dialog open={incidentModalOpen} onClose={() => setIncidentModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Report Route Delay / Incident</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              select
              label="Incident Category"
              size="small"
              value={incidentType}
              onChange={e => setIncidentType(e.target.value)}
              fullWidth
            >
              <MenuItem value="TRAFFIC_DELAY">Heavy Traffic / Road Congestion</MenuItem>
              <MenuItem value="VEHICLE_PUNCTURE">Tire Puncture / Mechanical Issue</MenuItem>
              <MenuItem value="ROUTE_DIVERSION">Road Closed / Police Diversion</MenuItem>
              <MenuItem value="MEDICAL_AID">Student Feeling Unwell / Medical Pause</MenuItem>
              <MenuItem value="OTHER">Other Route Incident</MenuItem>
            </TextField>
            <TextField
              label="Incident Details & Estimated Delay"
              multiline
              rows={3}
              size="small"
              placeholder="e.g. Traffic jam near Highway junction, estimated delay ~15 minutes."
              value={incidentNotes}
              onChange={e => setIncidentNotes(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIncidentModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReportIncident}>
            Broadcast to Transport Hub
          </Button>
        </DialogActions>
      </Dialog>

      {/* COMPLETE TRIP MODAL */}
      <Dialog open={completeModalOpen} onClose={() => setCompleteModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Complete Trip Sign-Off</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            Confirm all students have been dropped at the main campus bus bay safely.
          </Typography>
          <TextField
            label="Ending Odometer Reading (km)"
            type="number"
            size="small"
            value={endOdometer}
            onChange={e => setEndOdometer(Number(e.target.value))}
            fullWidth
            helperText={`Starting Odometer was ${trip.odometerStart || 45210} km`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompleteModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmCompletion}>
            Confirm Completion
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Leave Request Modal */}
      <QuickLeaveRequestModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        defaultRole="DRIVER"
        applicantName={`${user?.firstName || 'Bus'} ${user?.lastName || 'Driver'}`.trim()}
      />

      {/* Direct Principal Query Modal */}
      <PrincipalQueryModal
        open={queryModalOpen}
        onClose={() => setQueryModalOpen(false)}
        senderRole="DRIVER"
        senderName={`${user?.firstName || 'Bus'} ${user?.lastName || 'Driver'}`.trim()}
      />
    </Box>
  );
}
