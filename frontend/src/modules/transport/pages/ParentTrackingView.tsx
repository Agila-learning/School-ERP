import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, IconButton, Chip, Divider, Avatar,
  LinearProgress, Tooltip, Alert
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PhoneIcon from '@mui/icons-material/Phone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BackButton from '../../../shared/components/BackButton';
import { useLocation } from 'react-router-dom';

const STOPS = [
  { id: 1, name: 'Palm Meadows Gate 1', time: '07:25 AM', distance: '0.0 km', passed: true },
  { id: 2, name: 'Greenwood Estate Gate', time: '07:40 AM', distance: '1.2 km', passed: false, current: true },
  { id: 3, name: 'Lakeview Junction', time: '07:55 AM', distance: '3.8 km', passed: false },
  { id: 4, name: 'Main Campus East Gate', time: '08:15 AM', distance: '7.5 km', passed: false },
];

const ParentTrackingView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [progress, setProgress] = useState(38); // percentage along route (0 to 100)
  const [speed, setSpeed] = useState(36);
  const [etaSeconds, setEtaSeconds] = useState(145);
  const [distanceRemaining, setDistanceRemaining] = useState(1.1);
  const [lastPingSec, setLastPingSec] = useState(1);
  const [sosAlert, setSosAlert] = useState(false);

  // Real-time telemetry simulation interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1.2;
        return next > 95 ? 15 : next;
      });

      setSpeed(prev => {
        const delta = (Math.random() - 0.48) * 4;
        return Math.max(22, Math.min(48, Math.round(prev + delta)));
      });

      setEtaSeconds(prev => (prev > 10 ? prev - 2 : 180));
      setDistanceRemaining(prev => (prev > 0.1 ? Number((prev - 0.03).toFixed(2)) : 1.8));
      setLastPingSec(1);
    }, 2000);

    const pingTimer = setInterval(() => {
      setLastPingSec(prev => (prev < 15 ? prev + 1 : 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(pingTimer);
    };
  }, [isRunning]);

  const location = useLocation();
  const isStudent = location.pathname.startsWith('/student-portal');
  const etaMinutes = Math.ceil(etaSeconds / 60);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <BackButton 
          to={isStudent ? "/student-portal/dashboard" : "/parent-portal"} 
          label={isStudent ? "Back to Student Dashboard" : "Back to Parent Dashboard"} 
        />
      </Box>

      <Paper elevation={0} sx={{ width: '100%', maxWidth: 640, borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
        
        {/* Animated Real-time Map Area */}
        <Box sx={{ height: 260, bgcolor: '#0f172a', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
          {/* Simulated Grid Road Texture */}
          <Box sx={{ 
            position: 'absolute', inset: 0, opacity: 0.15,
            backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} />

          {/* SVG Road and Moving Bus Marker */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {/* Road path */}
            <path 
              d="M 40 200 Q 180 80, 320 180 T 600 70" 
              fill="none" 
              stroke="#334155" 
              strokeWidth="10" 
              strokeLinecap="round"
            />
            {/* Active travelled route track */}
            <path 
              d="M 40 200 Q 180 80, 320 180 T 600 70" 
              fill="none" 
              stroke="#0284c7" 
              strokeWidth="4" 
              strokeDasharray="6 4"
            />
          </svg>

          {/* Top Live Satellite Telemetry Bar */}
          <Box sx={{ zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
              <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 700, letterSpacing: 0.5 }}>
                LIVE GPS TELEMETRY
              </Typography>
              <Chip 
                size="small" 
                label={`Ping ${lastPingSec}s ago`} 
                sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }} 
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={isRunning ? "Pause Live Tracking" : "Resume Live Tracking"}>
                <IconButton 
                  size="small" 
                  onClick={() => setIsRunning(!isRunning)} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                >
                  {isRunning ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Animated Center Radar & Bus Marker */}
          <Box sx={{ zIndex: 10, alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', my: 'auto' }}>
            <Box sx={{ width: 110, height: 110, borderRadius: '50%', border: '1px solid rgba(56,189,248,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(56,189,248,0.6)', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.3 }} />
              <Box sx={{ width: 52, height: 52, bgcolor: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(2,132,199,0.9)', color: 'white' }}>
                <DirectionsBusIcon sx={{ fontSize: 28 }} />
              </Box>
            </Box>
            
            <Chip 
              label={`Live: ~${etaMinutes} mins away (${distanceRemaining} km)`} 
              color="primary" 
              size="small" 
              icon={<GpsFixedIcon sx={{ fontSize: '14px !important', ml: 1 }} />}
              sx={{ mt: -1.5, zIndex: 20, fontWeight: 800, boxShadow: '0 4px 14px rgba(0,0,0,0.6)', bgcolor: '#2563eb' }}
            />
          </Box>

          {/* Bottom Live Metrics */}
          <Box sx={{ zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', px: 2, py: 1, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 800 }}>{speed} km/h</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ color: '#10b981', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Approaching Stop 2</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>
              {Math.round(progress)}% of Route
            </Typography>
          </Box>
        </Box>

        {/* Bus Info Details */}
        <Box sx={{ p: 4, pt: 3 }}>
          {sosAlert && (
            <Alert severity="warning" onClose={() => setSosAlert(false)} sx={{ mb: 3 }}>
              Transport coordinator notified. Emergency contact: +91 98765 00011.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Route A1 - Morning Route</Typography>
              <Typography variant="body2" color="text.secondary">School Bus #04 • Toyota Coaster (KA-01-AB-1234)</Typography>
            </Box>
            <Chip label="IN TRANSIT" color="success" sx={{ fontWeight: 800 }} />
          </Box>

          {/* Route Progress Bar */}
          <Box sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Route Progression</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284c7' }}>{Math.round(progress)}% Completed</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#0284c7' } }} />
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Stops Timeline */}
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
            Route Stops & Real-Time ETAs
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {STOPS.map((stop, idx) => {
              const isPast = idx === 0;
              const isNext = idx === 1;
              return (
                <Box key={stop.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0.5 }}>
                    {isPast ? (
                      <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                    ) : isNext ? (
                      <RadioButtonCheckedIcon sx={{ fontSize: 20, color: '#0284c7', animation: 'pulse 1.5s infinite' }} />
                    ) : (
                      <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #cbd5e1', bgcolor: 'white' }} />
                    )}
                    {idx < STOPS.length - 1 && (
                      <Box sx={{ width: 2, height: 28, bgcolor: isPast ? '#10b981' : '#e2e8f0', my: 0.5 }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: isNext ? 800 : 600, color: isNext ? '#0284c7' : isPast ? '#64748b' : '#1e293b' }}>
                        {stop.name}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={isPast ? 'Passed' : isNext ? `In ~${etaMinutes} mins` : stop.time} 
                        color={isNext ? 'primary' : 'default'} 
                        variant={isNext ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700, height: 22, fontSize: 11 }} 
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Distance: {stop.distance} • Scheduled: {stop.time}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Driver & Support Contacts */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Rajesh Kumar</Typography>
                <Typography variant="caption" color="text.secondary">Certified School Bus Driver • 4.9 ⭐</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Call Driver">
                <IconButton 
                  component="a" 
                  href="tel:+919876543210" 
                  sx={{ bgcolor: '#eff6ff', color: '#0284c7', '&:hover': { bgcolor: '#dbeafe' } }}
                >
                  <PhoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Alert Coordinator / SOS">
                <IconButton 
                  onClick={() => setSosAlert(true)}
                  sx={{ bgcolor: '#fef2f2', color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                >
                  <NotificationsActiveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ParentTrackingView;