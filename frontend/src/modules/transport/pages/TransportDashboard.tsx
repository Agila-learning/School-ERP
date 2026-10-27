import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DirectionsBus as BusIcon,
  Map as MapIcon,
  Route as RouteIcon,
  People as StudentIcon,
  Build as MaintainIcon,
  Warning as AlertIcon,
  Speed as SpeedIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  GpsFixed as GpsIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Traffic as TrafficIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  NotificationsActive as NotificationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../../../core/api/axios';
import { publishNotification } from '../../../core/services/realtimeNotificationBus';

interface BusFleetItem {
  id: string;
  plate: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'IDLE' | 'DELAYED';
  driver: string;
  phone: string;
  route: string;
  speed: number;
  passengers: number;
  capacity: number;
  currentStopIndex: number;
  stops: string[];
  etas: string[];
  fuel: number;
  temp: number;
}

const initialFleet: BusFleetItem[] = [];
const initialAlerts: any[] = [];

const TransportDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [fleet, setFleet] = useState<BusFleetItem[]>(initialFleet);
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [alerts, setAlerts] = useState<any[]>(initialAlerts);
  const [isLive, setIsLive] = useState(true);
  const [liveTick, setLiveTick] = useState(0);

  // Fetch real backend fleet
  useEffect(() => {
    api.get('/transport/fleet')
      .then(res => {
        const vehicles = res.data?.data;
        if (Array.isArray(vehicles) && vehicles.length > 0) {
          const mapped: BusFleetItem[] = vehicles.map((v: any, idx: number) => ({
            id: v.vehicleNumber || `BUS-0${idx + 1}`,
            plate: v.registrationNumber || `KA-01-AB-100${idx}`,
            status: v.status || 'ACTIVE',
            driver: v.driverName || 'Designated Driver',
            phone: v.driverPhone || '',
            route: v.routeName || `Route R${idx + 1}`,
            speed: v.status === 'ACTIVE' ? (32 + (idx * 4)) : 0,
            passengers: v.currentOccupancy || 0,
            capacity: v.seatingCapacity || 40,
            currentStopIndex: 0,
            stops: v.stops?.length ? v.stops : ['Depot Standby', 'School Campus'],
            etas: ['Standby', 'Standby'],
            fuel: 80,
            temp: 24
          }));
          setFleet(mapped);
          setSelectedBusId(mapped[0]?.id || '');
        }
      })
      .catch(() => {});
  }, []);

  // Real-time telemetry simulation engine
  useEffect(() => {
    if (!isLive || fleet.length === 0) return;

    const interval = setInterval(() => {
      setLiveTick(t => t + 1);

      setFleet(prev => prev.map(bus => {
        if (bus.status !== 'ACTIVE' && bus.status !== 'DELAYED') return bus;
        const speedDelta = (Math.random() - 0.5) * 4;
        const newSpeed = Math.max(12, Math.min(52, Math.round(bus.speed + speedDelta)));
        
        return {
          ...bus,
          speed: newSpeed,
          temp: Math.min(26, Math.max(22, bus.temp + (Math.random() > 0.8 ? 0.5 : 0))),
          passengers: Math.min(bus.capacity, Math.max(0, bus.passengers))
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, fleet.length]);

  const selectedBus = fleet.find(b => b.id === selectedBusId) || fleet[0];

  // Real-time actions
  const handleTriggerDelay = (busId: string) => {
    if (!selectedBus) return;
    setFleet(prev => prev.map(b => b.id === busId ? { ...b, status: 'DELAYED', speed: 16 } : b));
    const newAlert = {
      id: Date.now(),
      type: 'DELAY',
      message: `${busId} reported traffic delay.`,
      time: 'Just now',
      busId
    };
    setAlerts(prev => [newAlert, ...prev]);

    publishNotification({
      title: `Transport Alert: ${busId} Delayed`,
      message: `${busId} on ${selectedBus.route} is experiencing traffic delay. Parents notified.`,
      category: 'TRANSPORT',
      severity: 'warning',
      link: '/transport/dashboard'
    });
  };

  const handleClearDelay = (busId: string) => {
    setFleet(prev => prev.map(b => b.id === busId ? { ...b, status: 'ACTIVE', speed: 38 } : b));
    publishNotification({
      title: `Transport Resolved: ${busId} On Schedule`,
      message: `${busId} has cleared traffic bottleneck.`,
      category: 'TRANSPORT',
      severity: 'success',
      link: '/transport/dashboard'
    });
  };

  const handleAdvanceStop = (busId: string) => {
    if (!selectedBus) return;
    setFleet(prev => prev.map(b => {
      if (b.id !== busId) return b;
      const nextIdx = Math.min(b.stops.length - 1, b.currentStopIndex + 1);
      const isLast = nextIdx === b.stops.length - 1;
      return {
        ...b,
        currentStopIndex: nextIdx,
        status: isLast ? 'ACTIVE' : b.status,
      };
    }));

    const nextStopName = selectedBus.stops[Math.min(selectedBus.stops.length - 1, selectedBus.currentStopIndex + 1)];
    publishNotification({
      title: `${busId} Telemetry: Stop Advanced`,
      message: `${busId} arrived at ${nextStopName}.`,
      category: 'TRANSPORT',
      severity: 'info',
      link: '/transport/dashboard'
    });
  };

  const handleSchoolGateArrival = (busId: string) => {
    if (!selectedBus) return;
    publishNotification({
      title: `Security Clearance: ${busId} At Main Gate`,
      message: `${busId} arrived at School Gate. Recorded in Watchman log.`,
      category: 'SECURITY',
      severity: 'success',
      link: '/security/watchman'
    });
  };

  const handleOpenDriverChat = (driverName: string) => {
    window.dispatchEvent(new CustomEvent('open_role_chat', { detail: { role: 'TRANSPORT_DRIVER' } }));
  };

  const activeFleetCount = fleet.filter(f => f.status === 'ACTIVE' || f.status === 'DELAYED').length;
  const totalStudentsInTransit = fleet.reduce((acc, f) => acc + (f.status === 'ACTIVE' || f.status === 'DELAYED' ? f.passengers : 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-6">
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-16 -translate-y-24 blur-3xl" />
        
        <div className="relative flex items-start justify-between flex-wrap gap-4 z-10">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
              <BusIcon style={{ fontSize: 34 }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Real-Time Fleet Command</h1>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-black uppercase tracking-wider border border-emerald-400/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live GPS Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 text-xs font-mono">
                  Tick #{liveTick}
                </span>
              </div>
              <p className="text-blue-100 text-sm mt-1 max-w-xl">
                Real-time school transport telematics, live route progression, passenger boarding counters, and driver-to-command communications.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Active Fleet', value: activeFleetCount, color: 'bg-emerald-500/30 border-emerald-400/30' },
              { label: 'In Transit', value: `${totalStudentsInTransit} Scholars`, color: 'bg-sky-500/30 border-sky-400/30' },
              { label: 'Fleet Speed', value: `${selectedBus?.speed || 0} km/h`, color: 'bg-blue-800/40 border-blue-400/30' },
              { label: 'Total Fleet', value: fleet.length, color: 'bg-indigo-500/30 border-indigo-400/30' },
            ].map(s => (
              <div key={s.label} className={`${s.color} backdrop-blur-md rounded-2xl px-4 py-3 text-center border shadow-lg min-w-[105px]`}>
                <p className="text-xl md:text-2xl font-black">{s.value}</p>
                <p className="text-[10px] text-blue-100 mt-1 uppercase tracking-wider font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Cols */}
        <div className="xl:col-span-2 space-y-6">
          
          {fleet.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <BusIcon style={{ fontSize: 32 }} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No Vehicles Registered in Fleet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
                Register buses and assign routes in Transport Fleet Management to enable live GPS telemetry, stop tracking, and boarding counters.
              </p>
              <button 
                onClick={() => navigate('/transport/vehicles')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                + Add First Vehicle
              </button>
            </div>
          ) : (
            <>
              {/* Live Fleet Ribbon Switcher */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <SpeedIcon className="text-blue-600" />
                    <h2 className="font-extrabold text-gray-800 text-base">Select Bus for Live Telemetry</h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsLive(!isLive)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isLive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isLive ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
                      {isLive ? 'Streaming Telemetry' : 'Simulation Paused'}
                    </button>
                    <button 
                      onClick={() => navigate('/transport/trips')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Full Map View →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {fleet.map(bus => {
                    const isSelected = bus.id === selectedBusId;
                    return (
                      <div
                        key={bus.id}
                        onClick={() => setSelectedBusId(bus.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20' 
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1.5">
                            <BusIcon className={isSelected ? 'text-blue-600' : 'text-gray-400'} style={{ fontSize: 18 }} />
                            <span className="font-black text-gray-900 text-sm">{bus.id}</span>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                            bus.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                            bus.status === 'DELAYED' ? 'bg-amber-100 text-amber-700' :
                            bus.status === 'MAINTENANCE' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {bus.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-gray-500 truncate">{bus.plate}</p>
                        <div className="mt-2 flex items-center justify-between text-xs font-bold text-gray-700">
                          <span className="flex items-center gap-1 text-blue-600">
                            <SpeedIcon style={{ fontSize: 13 }} /> {bus.speed} km/h
                          </span>
                          <span className="text-gray-500 font-medium text-[11px]">
                            {bus.passengers}/{bus.capacity} seats
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Live Route Progress & Telematics Cockpit */}
              {selectedBus && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start flex-wrap gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-gray-900">
                          {selectedBus.id} Route Progression & Telematics
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                          {selectedBus.route}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Driver: <strong>{selectedBus.driver}</strong> {selectedBus.phone && `(${selectedBus.phone})`} · Registration: {selectedBus.plate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Speed</span>
                        <span className="text-sm font-black text-blue-600">{selectedBus.speed} km/h</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Fuel</span>
                        <span className="text-sm font-black text-emerald-600">{selectedBus.fuel}%</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Cabin</span>
                        <span className="text-sm font-black text-indigo-600">{selectedBus.temp}°C</span>
                      </div>
                    </div>
                  </div>

                  {/* Stepper Timeline */}
                  <div className="my-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Real-Time Route Waypoints
                    </p>

                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-6 right-6 top-5 h-1 bg-gray-200 -z-0" />
                      <div 
                        className="absolute left-6 top-5 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 -z-0 transition-all duration-500" 
                        style={{ width: `${(selectedBus.currentStopIndex / Math.max(1, selectedBus.stops.length - 1)) * 92}%` }}
                      />

                      {selectedBus.stops.map((stop, idx) => {
                        const isPassed = idx < selectedBus.currentStopIndex;
                        const isCurrent = idx === selectedBus.currentStopIndex;

                        return (
                          <div key={stop} className="flex flex-col items-center text-center z-10 max-w-[110px]">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isPassed ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' :
                              isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-200 shadow-lg' :
                              'bg-white border-2 border-gray-300 text-gray-500'
                            }`}>
                              {isPassed ? <CheckCircleIcon style={{ fontSize: 18 }} /> : idx + 1}
                            </div>
                            <span className="text-xs font-bold text-gray-800 mt-2 leading-tight">{stop}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cockpit Actions */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdvanceStop(selectedBus.id)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <LocationIcon style={{ fontSize: 16 }} /> Advance Stop
                      </button>

                      {selectedBus.status === 'DELAYED' ? (
                        <button
                          onClick={() => handleClearDelay(selectedBus.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircleIcon style={{ fontSize: 16 }} /> Clear Delay
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTriggerDelay(selectedBus.id)}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <TrafficIcon style={{ fontSize: 16 }} /> Simulate Delay
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSchoolGateArrival(selectedBus.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <GpsIcon style={{ fontSize: 16 }} /> Log Gate Clearance
                      </button>

                      <button
                        onClick={() => handleOpenDriverChat(selectedBus.driver)}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <ChatIcon style={{ fontSize: 16 }} /> Message Driver
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Right Col: Real-Time Alerts & Transport Navigation */}
        <div className="space-y-6">
          
          {/* Dispatch Alerts */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-extrabold text-gray-800 flex items-center gap-2">
                <AlertIcon className="text-amber-500" /> Real-Time Dispatch Alerts
              </h2>
              <span className="text-xs font-bold text-gray-400 font-mono">
                {alerts.length} Active
              </span>
            </div>
            
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <CheckCircleIcon className="text-emerald-500 mb-1" style={{ fontSize: 28 }} />
                  <p className="text-xs font-bold text-gray-600">No Active Transport Alerts</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">All fleet vehicles are running normally without delay.</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start hover:bg-slate-100/70 transition-colors">
                    <div className={`mt-0.5 shrink-0 ${
                      alert.type === 'DELAY' ? 'text-amber-500' :
                      alert.type === 'SECURITY' ? 'text-emerald-500' : 'text-blue-500'
                    }`}>
                      {alert.type === 'DELAY' ? <TrafficIcon style={{ fontSize: 18 }} /> :
                       alert.type === 'SECURITY' ? <GpsIcon style={{ fontSize: 18 }} /> :
                       <MaintainIcon style={{ fontSize: 18 }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-tight">{alert.message}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-gray-400">{alert.time}</span>
                        <span className="text-[10px] font-bold text-indigo-600">{alert.busId}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Module Launchpad */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-extrabold text-gray-800 mb-4">Transport Modules</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Drivers & Duty Desk', icon: <PersonIcon />, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', link: '/transport/staff' },
                { label: 'Live Trip Monitor', icon: <SpeedIcon />, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100', link: '/transport/trips' },
                { label: 'Parent Live Tracking', icon: <MapIcon />, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', link: '/transport/parent' },
                { label: 'Route & Stop Manager', icon: <RouteIcon />, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', link: '/transport/routes' },
                { label: 'Passenger Allocation', icon: <StudentIcon />, color: 'bg-teal-50 text-teal-700 hover:bg-teal-100', link: '/transport/assignments' },
                { label: 'Fleet & Service Bays', icon: <MaintainIcon />, color: 'bg-rose-50 text-rose-700 hover:bg-rose-100', link: '/transport/vehicles' },
              ].map(action => (
                <button 
                  key={action.label} 
                  onClick={() => navigate(action.link)}
                  className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border border-transparent hover:border-current/10 ${action.color}`}
                >
                  <div style={{ fontSize: 24, display: 'flex' }}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-bold text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TransportDashboard;
