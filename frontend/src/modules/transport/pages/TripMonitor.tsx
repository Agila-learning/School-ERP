import React, { useState, useEffect } from 'react';
import {
  DirectionsBus as BusIcon,
  LocationOn as PinIcon,
  Speed as SpeedIcon,
  Warning as AlertIcon,
  Phone as PhoneIcon,
  CheckCircle as OkIcon,
  Traffic as TrafficIcon,
  Chat as ChatIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  GpsFixed as GpsIcon,
  People as StudentIcon,
  LocalGasStation as FuelIcon,
  Thermostat as TempIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { LinearProgress } from '@mui/material';
import { publishNotification } from '../../../core/services/realtimeNotificationBus';

interface TripData {
  id: string;
  route: string;
  bus: string;
  plate: string;
  driver: string;
  phone: string;
  status: 'ON_TIME' | 'DELAYED' | 'ARRIVED';
  speed: number;
  progress: number;
  nextStop: string;
  eta: string;
  fuel: number;
  temp: number;
  passengers: number;
  capacity: number;
  mapX: number;
  mapY: number;
  stops: { name: string; time: string; passed: boolean }[];
  onboardStudents: string[];
}

const initialTrips: TripData[] = [
  {
    id: 'TRP-101',
    route: 'Route 1 - Andheri West Morning Express',
    bus: 'BUS-01',
    plate: 'MH-04-AB-1234',
    driver: 'Rajendra "Raju" Sharma',
    phone: '+91 98201 44521',
    status: 'ON_TIME',
    speed: 38,
    progress: 65,
    nextStop: 'Versova Metro Station',
    eta: '3 mins',
    fuel: 78,
    temp: 24,
    passengers: 34,
    capacity: 40,
    mapX: 380,
    mapY: 280,
    stops: [
      { name: 'Depot Departure', time: '07:30 AM', passed: true },
      { name: 'Four Bungalows', time: '07:42 AM', passed: true },
      { name: 'Versova Metro', time: '07:55 AM', passed: false },
      { name: 'Green Park Stop', time: '08:05 AM', passed: false },
      { name: 'St. Xavier School Gate', time: '08:15 AM', passed: false },
    ],
    onboardStudents: ['Aarav Sharma (9A)', 'Ananya Sen (10B)', 'Rohan Iyer (11C)', 'Kavya Nair (8A)', 'Dev Patel (12A)']
  },
  {
    id: 'TRP-102',
    route: 'Route 3 - Bandra East Campus Shuttle',
    bus: 'BUS-03',
    plate: 'MH-04-AB-5678',
    driver: 'Suresh Kumar Yadav',
    phone: '+91 98334 11209',
    status: 'DELAYED',
    speed: 18,
    progress: 35,
    nextStop: 'Linking Road Intersection',
    eta: '9 mins (Traffic)',
    fuel: 85,
    temp: 23,
    passengers: 28,
    capacity: 32,
    mapX: 240,
    mapY: 180,
    stops: [
      { name: 'BKC Depot', time: '07:35 AM', passed: true },
      { name: 'Linking Road', time: '07:50 AM', passed: false },
      { name: 'Khar Gymkhana', time: '08:02 AM', passed: false },
      { name: 'School Main Gate', time: '08:15 AM', passed: false },
    ],
    onboardStudents: ['Meera Joshi (7A)', 'Tanmay Deshmukh (11B)', 'Aditya Rao (10A)', 'Pooja Verma (9C)']
  },
  {
    id: 'TRP-103',
    route: 'Route 4 - Borivali Link Feeder',
    bus: 'BUS-04',
    plate: 'MH-04-AB-9012',
    driver: 'Ramesh Singh Thakur',
    phone: '+91 97654 32180',
    status: 'ON_TIME',
    speed: 44,
    progress: 82,
    nextStop: 'St. Xavier School Gate',
    eta: '2 mins',
    fuel: 91,
    temp: 22,
    passengers: 42,
    capacity: 50,
    mapX: 620,
    mapY: 360,
    stops: [
      { name: 'Shimpoli Road', time: '07:20 AM', passed: true },
      { name: 'Kandivali Signal', time: '07:35 AM', passed: true },
      { name: 'Malad Station', time: '07:50 AM', passed: true },
      { name: 'St. Xavier School Gate', time: '08:05 AM', passed: false },
    ],
    onboardStudents: ['Siddharth Jain (12B)', 'Neha Kulkarni (9B)', 'Varun Shah (8B)', 'Rhea Menon (10C)']
  }
];

const TripMonitor: React.FC = () => {
  const [trips, setTrips] = useState<TripData[]>(initialTrips);
  const [selectedTripId, setSelectedTripId] = useState<string>('TRP-101');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  // Live GPS simulation loop
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setTrips(prev => prev.map(t => {
        const speedDelta = (Math.random() - 0.5) * 4;
        const newSpeed = t.status === 'DELAYED'
          ? Math.max(12, Math.min(24, Math.round(t.speed + speedDelta)))
          : Math.max(28, Math.min(52, Math.round(t.speed + speedDelta)));
        
        // Slight coordinate movement along route
        const dx = (Math.random() - 0.48) * 3;
        const dy = (Math.random() - 0.48) * 3;

        return {
          ...t,
          speed: newSpeed,
          mapX: Math.max(150, Math.min(750, t.mapX + dx)),
          mapY: Math.max(100, Math.min(450, t.mapY + dy)),
          progress: Math.min(98, t.progress + 0.1)
        };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const handleAdvanceNextStop = () => {
    setTrips(prev => prev.map(t => {
      if (t.id !== selectedTrip.id) return t;
      const unpassedIdx = t.stops.findIndex(s => !s.passed);
      if (unpassedIdx !== -1) {
        const updatedStops = t.stops.map((s, idx) => idx === unpassedIdx ? { ...s, passed: true } : s);
        const nextUpcoming = updatedStops.find(s => !s.passed);
        return {
          ...t,
          stops: updatedStops,
          nextStop: nextUpcoming ? nextUpcoming.name : 'School Gate (Arrived)',
          eta: nextUpcoming ? '4 mins' : 'Arrived at School',
          progress: Math.min(100, t.progress + 15),
          passengers: Math.min(t.capacity, t.passengers + 2)
        };
      }
      return t;
    }));

    publishNotification({
      title: `${selectedTrip.bus} Telemetry Update`,
      message: `${selectedTrip.bus} passed stop. Next waypoint: ${selectedTrip.nextStop}`,
      category: 'TRANSPORT',
      severity: 'info',
      link: '/transport/trips'
    });
  };

  const handleToggleTraffic = () => {
    const isCurrentlyDelayed = selectedTrip.status === 'DELAYED';
    const newStatus = isCurrentlyDelayed ? 'ON_TIME' : 'DELAYED';
    
    setTrips(prev => prev.map(t => t.id === selectedTrip.id ? {
      ...t,
      status: newStatus,
      speed: isCurrentlyDelayed ? 38 : 16,
      eta: isCurrentlyDelayed ? '4 mins' : '11 mins (Traffic Jam)'
    } : t));

    if (!isCurrentlyDelayed) {
      publishNotification({
        title: `Traffic Alert: ${selectedTrip.bus}`,
        message: `${selectedTrip.bus} speed slowed on ${selectedTrip.route}. ETA updated.`,
        category: 'TRANSPORT',
        severity: 'warning',
        link: '/transport/trips'
      });
    } else {
      publishNotification({
        title: `Traffic Cleared: ${selectedTrip.bus}`,
        message: `${selectedTrip.bus} has resumed normal scheduled speed.`,
        category: 'TRANSPORT',
        severity: 'success',
        link: '/transport/trips'
      });
    }
  };

  const handleOpenDriverChat = () => {
    window.dispatchEvent(new CustomEvent('open_role_chat', { detail: { role: 'TRANSPORT_DRIVER' } }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <SpeedIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 leading-tight">Live Interactive Trip Monitor</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live GPS Active
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Track real-time bus coordinates, route waypoints, and telemetry feeds.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isLiveStreaming ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isLiveStreaming ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
            {isLiveStreaming ? 'Live GPS Streaming' : 'Simulation Paused'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Active Trips List */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/70 flex justify-between items-center">
            <h2 className="font-extrabold text-gray-800 text-sm">Active Morning Trips ({trips.length})</h2>
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Live Telemetry</span>
          </div>
          
          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh]">
            {trips.map(trip => {
              const isSelected = selectedTrip.id === trip.id;
              return (
                <div 
                  key={trip.id} 
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-50/80 border-indigo-400 shadow-md ring-2 ring-indigo-200' 
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                      <BusIcon className={isSelected ? 'text-indigo-600' : 'text-gray-400'} style={{ fontSize: 18 }} />
                      <span className="font-black text-gray-900 font-mono text-sm">{trip.bus}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      trip.status === 'DELAYED' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {trip.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-xs font-semibold text-gray-700 mb-2 truncate">{trip.route}</p>
                  
                  <div className="flex items-center justify-between text-[11px] text-gray-600 mb-2">
                    <span className="font-bold text-blue-600 flex items-center gap-1">
                      <SpeedIcon style={{ fontSize: 14 }} /> {trip.speed} km/h
                    </span>
                    <span className="text-gray-500">{trip.passengers}/{trip.capacity} students</span>
                  </div>

                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-1.5">
                    <div 
                      className={`h-full rounded-full transition-all ${trip.status === 'DELAYED' ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                      style={{ width: `${trip.progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>Depot</span>
                    <span>Next: {trip.nextStop}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Mock Map & Interactive Telemetry Cockpit */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          
          {/* Map Top Bar */}
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">
                  {selectedTrip.bus} Telemetry Stream · {selectedTrip.route}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Plate: {selectedTrip.plate} · Driver: {selectedTrip.driver} ({selectedTrip.phone})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAdvanceNextStop}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <ArrowIcon style={{ fontSize: 14 }} /> Advance Stop
              </button>
              <button
                onClick={handleToggleTraffic}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTrip.status === 'DELAYED'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                <TrafficIcon style={{ fontSize: 14 }} />
                {selectedTrip.status === 'DELAYED' ? 'Clear Delay' : 'Simulate Delay'}
              </button>
              <button
                onClick={handleOpenDriverChat}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <ChatIcon style={{ fontSize: 14 }} /> Chat Driver
              </button>
            </div>
          </div>

          {/* Interactive Map Canvas Area */}
          <div className="h-[400px] bg-[#0f172a] relative overflow-hidden select-none">
            
            {/* Dark Styled Map Grid & Roads (SVG) */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="darkgrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#darkgrid)" />
              
              {/* Secondary roads */}
              <path d="M 0 140 Q 250 160 500 120 T 900 160" fill="none" stroke="#1e293b" strokeWidth="16" />
              <path d="M 200 0 L 200 600" fill="none" stroke="#1e293b" strokeWidth="12" />
              <path d="M 650 0 L 650 600" fill="none" stroke="#1e293b" strokeWidth="12" />
              
              {/* Primary Arterial Road */}
              <path d="M 50 100 Q 250 180 450 300 T 850 380" fill="none" stroke="#334155" strokeWidth="22" strokeLinecap="round" />
              <path d="M 50 100 Q 250 180 450 300 T 850 380" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 6" />

              {/* Active Route Glow Path */}
              <path 
                d="M 50 100 Q 250 180 450 300 T 850 380" 
                fill="none" 
                stroke={selectedTrip.status === 'DELAYED' ? '#f43f5e' : '#6366f1'} 
                strokeWidth="6" 
                strokeDasharray="10 10" 
                className="animate-[dash_1s_linear_infinite]" 
              />
            </svg>

            <style>{`
              @keyframes dash {
                to { stroke-dashoffset: -20; }
              }
              .pulse-ring-slow {
                animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              }
            `}</style>

            {/* School Campus Destination Marker */}
            <div className="absolute top-[370px] left-[840px] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <div className="bg-emerald-500 text-white p-2 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center">
                <PinIcon style={{ fontSize: 24 }} />
              </div>
              <div className="mt-1 bg-slate-900/90 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-md">
                St. Xavier Campus Gate
              </div>
            </div>

            {/* Moving Bus Marker */}
            <div 
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-all duration-700 ease-out"
              style={{ top: `${selectedTrip.mapY}px`, left: `${selectedTrip.mapX}px` }}
            >
              <div className={`p-2.5 rounded-2xl shadow-2xl relative z-10 border-2 border-white ${
                selectedTrip.status === 'DELAYED' ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
              }`}>
                <BusIcon style={{ fontSize: 22 }} />
              </div>
              <div className={`absolute inset-0 rounded-2xl pulse-ring-slow opacity-60 z-0 ${
                selectedTrip.status === 'DELAYED' ? 'bg-rose-500' : 'bg-indigo-500'
              }`} />
              
              <div className="mt-1 bg-white text-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-lg border border-slate-200 whitespace-nowrap flex items-center gap-1">
                <span>{selectedTrip.bus}</span>
                <span className="text-indigo-600">({selectedTrip.speed} km/h)</span>
              </div>
            </div>

            {/* Next Stop Waypoint Marker */}
            <div className="absolute top-[280px] left-[520px] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <div className="text-amber-400 drop-shadow-lg">
                <PinIcon style={{ fontSize: 28 }} />
              </div>
              <div className="bg-slate-900/90 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md whitespace-nowrap -mt-1">
                Next: {selectedTrip.nextStop}
              </div>
            </div>

            {/* Telemetry HUD in top left corner */}
            <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3 text-white shadow-xl min-w-[170px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Telemetry HUD</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Speed:</span>
                  <span className="font-bold text-blue-400 font-mono">{selectedTrip.speed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fuel:</span>
                  <span className="font-bold text-emerald-400 font-mono">{selectedTrip.fuel}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Temp:</span>
                  <span className="font-bold text-purple-400 font-mono">{selectedTrip.temp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ETA:</span>
                  <span className="font-bold text-amber-400 font-mono">{selectedTrip.eta}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Telemetry Footer & Onboard Scholars */}
          <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Route Stops Timeline */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Live Waypoint Schedule
              </h4>
              <div className="space-y-2">
                {selectedTrip.stops.map((stop, i) => (
                  <div 
                    key={stop.name} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      stop.passed 
                        ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900' 
                        : 'bg-slate-50 border-slate-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {stop.passed ? (
                        <OkIcon style={{ fontSize: 16 }} className="text-emerald-600" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                          {i + 1}
                        </span>
                      )}
                      <span className="font-bold">{stop.name}</span>
                    </div>
                    <span className="font-mono text-gray-500 text-[11px]">{stop.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Onboard Students List */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                  <StudentIcon style={{ fontSize: 16 }} className="text-indigo-600" />
                  Scholars Onboard
                </h4>
                <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  {selectedTrip.passengers}
                </span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedTrip.onboardStudents.map(st => (
                  <div key={st} className="p-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-gray-800 flex items-center justify-between">
                    <span>{st}</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">RFID Boarded</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default TripMonitor;
