import React, { useState, useEffect } from 'react';
import { getTrips, startTrip, endTrip, recordBoarding } from '../api/transport.api';
import type { Trip } from '../api/transport.api';

const DriverView: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showEmergency, setShowEmergency] = useState(false);
  const [preCheckComplete, setPreCheckComplete] = useState(false);
  
  const [todayTrip, setTodayTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getTrips(new Date().toISOString()).then(data => {
      if (data.length > 0) {
        setTodayTrip(data[0]); // for demo, picking first trip
      }
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleStartTrip = async () => {
    if(!todayTrip) return;
    try {
      await startTrip(todayTrip._id, 1000); // 1000 is mock odometer
      setTodayTrip({...todayTrip, status: 'IN_PROGRESS'});
    } catch(err) {
      alert('Failed to start trip');
    }
  };

  const handleEndTrip = async () => {
    if(!todayTrip) return;
    try {
      await endTrip(todayTrip._id, 1050); // 1050 is mock end odometer
      setTodayTrip({...todayTrip, status: 'COMPLETED'});
    } catch(err) {
      alert('Failed to end trip');
    }
  };

  const handleBoard = async (studentId: string, stopId: string) => {
    if(!todayTrip) return;
    try {
      await recordBoarding(todayTrip._id, { studentId, stopId, scanType: 'MANUAL', remarks: 'By Driver' });
      alert('Boarding recorded');
    } catch(err: any) {
      alert(err.response?.data?.message || 'Failed to record boarding');
    }
  };

  const preChecks = [
    { id: 'brakes', label: 'Brakes', critical: true },
    { id: 'tyres', label: 'Tyres', critical: true },
    { id: 'lights', label: 'Lights', critical: true },
    { id: 'doors', label: 'Doors', critical: true },
    { id: 'firstaid', label: 'First Aid Kit', critical: false },
    { id: 'fire', label: 'Fire Extinguisher', critical: false },
  ];

  const [checkState, setCheckState] = useState<Record<string, 'PASS' | 'FAIL' | null>>({});

  const allCriticalChecked = preChecks.filter(c => c.critical).every(c => checkState[c.id] !== null && checkState[c.id] !== undefined);
  const anyFail = Object.values(checkState).some(v => v === 'FAIL');

  if(loading) return <div className="min-h-screen bg-gray-950 text-white p-4">Loading Driver Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">DRIVER VIEW</p>
          <h1 className="font-bold text-lg">{(todayTrip?.routeId as any)?.name || 'No Route Assigned'}</h1>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-green-400">
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </p>
          <p className="text-xs text-gray-500">{(todayTrip?.vehicleId as any)?.vehicleNumber || 'No Vehicle'}</p>
        </div>
      </div>

      {/* Pre-Trip Check */}
      {!preCheckComplete && (
        <div className="p-4 space-y-4">
          <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4">
            <h2 className="font-semibold text-amber-400 mb-1">⚠️ Pre-Trip Safety Check Required</h2>
            <p className="text-xs text-amber-300">Complete all critical checks before starting the trip.</p>
          </div>
          <div className="space-y-2">
            {preChecks.map((check) => (
              <div key={check.id} className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="font-medium">{check.label}</span>
                  {check.critical && <span className="ml-2 text-xs text-red-400">*Critical</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckState(p => ({ ...p, [check.id]: 'PASS' }))}
                    className={`w-16 py-1.5 rounded-lg text-sm font-bold transition-colors ${checkState[check.id] === 'PASS' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-green-900 hover:text-green-400'}`}
                  >PASS</button>
                  <button
                    onClick={() => setCheckState(p => ({ ...p, [check.id]: 'FAIL' }))}
                    className={`w-16 py-1.5 rounded-lg text-sm font-bold transition-colors ${checkState[check.id] === 'FAIL' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-red-900 hover:text-red-400'}`}
                  >FAIL</button>
                </div>
              </div>
            ))}
          </div>
          {anyFail && (
            <div className="bg-red-900/40 border border-red-700 rounded-xl p-3 text-sm text-red-300">
              ⛔ A critical safety check failed. Please contact the transport manager before proceeding.
            </div>
          )}
          <button
            disabled={!allCriticalChecked || anyFail}
            onClick={() => setPreCheckComplete(true)}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              allCriticalChecked && !anyFail
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            Confirm & Proceed to Start
          </button>
        </div>
      )}

      {/* Main Trip View */}
      {preCheckComplete && todayTrip?.status !== 'IN_PROGRESS' && todayTrip?.status !== 'COMPLETED' && (
        <div className="p-4 space-y-4">
          <div className="bg-gray-900 rounded-xl p-6 text-center space-y-2">
            <p className="text-gray-400 text-sm">All checks passed. Ready to start trip.</p>
            <p className="text-white font-semibold text-lg">{(todayTrip?.routeId as any)?.name} · {new Date().toLocaleDateString('en-IN')}</p>
            <button
              onClick={handleStartTrip}
              className="mt-4 w-full py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-bold text-xl text-white transition-colors active:scale-95"
            >
              🚌 START TRIP
            </button>
          </div>
        </div>
      )}

      {todayTrip?.status === 'IN_PROGRESS' && (
        <div className="p-4 space-y-4">
          {/* Route Progress */}
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Live Trip In Progress</h3>
            <p className="text-sm text-gray-500 mb-4">You are currently tracking GPS and accepting boarding events.</p>
            
            {/* Quick Demo Boarding Tool */}
            <div className="space-y-2">
              <input type="text" placeholder="Scan Student ID or Enter ObjectID" className="w-full bg-gray-800 border-none rounded p-2 text-white text-sm" id="demo_student_id" />
              <input type="text" placeholder="Stop ID" className="w-full bg-gray-800 border-none rounded p-2 text-white text-sm" id="demo_stop_id" />
              <button 
                onClick={() => {
                  const s = (document.getElementById('demo_student_id') as HTMLInputElement).value;
                  const st = (document.getElementById('demo_stop_id') as HTMLInputElement).value;
                  handleBoard(s, st);
                }}
                className="w-full py-2 bg-indigo-600 text-white rounded font-bold"
              >
                Manual Board
              </button>
            </div>
          </div>

          <button
            onClick={handleEndTrip}
            className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl font-bold text-white text-lg transition-colors active:scale-95"
          >
            🛑 END TRIP
          </button>

          {/* Emergency Button */}
          <button
            onClick={() => setShowEmergency(true)}
            className="w-full py-4 bg-red-700 hover:bg-red-600 rounded-2xl font-bold text-white text-lg transition-colors active:scale-95 border-2 border-red-500"
          >
            🚨 EMERGENCY ALERT
          </button>
        </div>
      )}

      {todayTrip?.status === 'COMPLETED' && (
        <div className="p-4 space-y-4">
          <div className="bg-gray-900 rounded-xl p-6 text-center space-y-2">
            <p className="text-white font-semibold text-lg">Trip Completed</p>
            <p className="text-gray-400 text-sm">Great job! You have safely completed the trip.</p>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      {showEmergency && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50 p-4">
          <div className="w-full bg-gray-900 rounded-2xl p-6 space-y-3 border border-red-800">
            <h2 className="text-red-400 font-bold text-lg text-center">Select Emergency Type</h2>
            {['Accident', 'Medical Emergency', 'Vehicle Breakdown', 'Security Issue', 'Student Incident', 'Other'].map((type) => (
              <button
                key={type}
                className="w-full py-3 bg-red-900/30 text-red-300 border border-red-800 rounded-xl text-sm font-medium hover:bg-red-900 transition-colors"
              >
                {type}
              </button>
            ))}
            <button onClick={() => setShowEmergency(false)} className="w-full py-3 bg-gray-800 text-gray-400 rounded-xl text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverView;
