import React, { useState, useEffect } from 'react';
import { getRoutes, getRouteStops, assignStudentTransport, getAssignments, removeAssignment } from '../api/transport.api';
import type { Route, RouteStop, TransportAssignment } from '../api/transport.api';

const StudentTransportAssignment: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [feeAmount, setFeeAmount] = useState<number>(1000);
  const academicYearId = '';
  const branchId = '';
  const [assignments, setAssignments] = useState<TransportAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getRoutes().then(setRoutes).catch(console.error);
    getAssignments().then(setAssignments).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      getRouteStops(selectedRoute).then(setStops).catch(console.error);
    } else {
      setStops([]);
    }
  }, [selectedRoute]);

  const handleAssign = async () => {
    if (!studentId || !selectedRoute || !selectedStop) {
      setMessage('Please select student, route, and stop.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await assignStudentTransport({
        studentId,
        routeId: selectedRoute,
        pickupStopId: selectedStop,
        dropoffStopId: selectedStop,
        feeAmount,
        academicYearId: academicYearId || '650000000000000000000000', // Mock ObjectIds if empty for testing
        branchId: branchId || '650000000000000000000000'
      });
      setMessage('Student assigned successfully!');
      setStudentId('');
      getAssignments().then(setAssignments);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to assign student. Capacity full?');
    }
    setLoading(false);
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;
    try {
      await removeAssignment(id);
      getAssignments().then(setAssignments);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove assignment');
    }
  };


  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Transport Allocations</h1>
          <p className="text-sm text-gray-500">Manage route enrollments and integrate with Finance Fee Demands</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Recent Assignments</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">{assignments.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {assignments.map(a => (
              <div key={a._id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-bold text-gray-900">{(a.studentId as any)?.firstName} {(a.studentId as any)?.lastName}</h3>
                <p className="text-xs text-gray-500 mb-2">ADM: {(a.studentId as any)?.admissionNumber || 'N/A'}</p>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="font-medium text-indigo-700">Route: {(a.routeId as any)?.name}</span>
                  <span className="text-gray-500">{(a.pickupStopId as any)?.name}</span>
                </div>
                <div className="mt-2 text-right">
                  <button onClick={() => handleRemove(a._id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                </div>
              </div>
            ))}
            {assignments.length === 0 && <p className="text-sm text-gray-500 p-2">No active assignments.</p>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Allocation</h2>
            {message && <p className={`text-sm mb-4 font-bold ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Student ID</label>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Paste Student MongoDB _id here"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Route</label>
                <select 
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Route --</option>
                  {routes.map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Stop</label>
                <select 
                  value={selectedStop}
                  onChange={(e) => setSelectedStop(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                  disabled={!selectedRoute}
                >
                  <option value="">-- Choose Stop --</option>
                  {stops.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.pickupTime})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Transport Fee</label>
                <input 
                  type="number" 
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(+e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 bg-gray-50/50 flex flex-col justify-end space-y-6">
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={handleAssign}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Assign Transport'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTransportAssignment;
