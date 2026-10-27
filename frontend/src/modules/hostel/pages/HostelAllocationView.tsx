import React, { useState } from 'react';

interface Application {
  id: string;
  studentName: string;
  studentRoll: string;
  class: string;
  hostelPref: string;
  roomTypePref: string;
  boardingType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
  dateApplied: string;
}

const HostelAllocationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'ALLOCATIONS'>('APPLICATIONS');

  const applications: Application[] = [
    { id: '1', studentName: 'Ravi M.', studentRoll: 'STD-007', class: 'X-A', hostelPref: 'Boys Hostel A', roomTypePref: 'Double', boardingType: 'Full Boarding', status: 'PENDING', dateApplied: '2026-08-01' },
    { id: '2', studentName: 'Ananya P.', studentRoll: 'STD-021', class: 'XI-B', hostelPref: 'Girls Hostel B', roomTypePref: 'Single', boardingType: 'Weekly Boarding', status: 'WAITLISTED', dateApplied: '2026-07-28' },
    { id: '3', studentName: 'Vikram S.', studentRoll: 'STD-033', class: 'IX-A', hostelPref: 'Senior Block C', roomTypePref: 'Dormitory', boardingType: 'Full Boarding', status: 'APPROVED', dateApplied: '2026-08-02' },
  ];

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    WAITLISTED: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hostel Allocation</h1>
          <p className="text-sm text-gray-500">Manage student applications and bed assignments</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Allocation
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'APPLICATIONS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Applications
        </button>
        <button
          onClick={() => setActiveTab('ALLOCATIONS')}
          className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'ALLOCATIONS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Active Allocations
        </button>
      </div>

      {activeTab === 'APPLICATIONS' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Student</th>
                <th className="px-6 py-3 text-left font-medium">Preference</th>
                <th className="px-6 py-3 text-left font-medium">Boarding Type</th>
                <th className="px-6 py-3 text-left font-medium">Date Applied</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{app.studentName}</p>
                    <p className="text-xs text-gray-500">{app.studentRoll} · Class {app.class}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{app.hostelPref}</p>
                    <p className="text-xs text-gray-500">{app.roomTypePref}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{app.boardingType}</td>
                  <td className="px-6 py-4 text-gray-600">{app.dateApplied}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {app.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium">Approve</button>
                        <button className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium">Reject</button>
                      </div>
                    ) : app.status === 'APPROVED' ? (
                      <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium">Allocate Bed</button>
                    ) : (
                      <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ALLOCATIONS' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p>No active allocations match the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default HostelAllocationView;
