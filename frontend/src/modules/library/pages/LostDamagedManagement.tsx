import React, { useState } from 'react';
import { 
  ReportProblem as AlertIcon, 
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const LostDamagedManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const incidents = [
    { id: '1', bookTitle: 'Advanced Physics, 10th Ed.', barcode: 'LIB-2026-0451', member: 'Rahul Sharma', type: 'Lost', date: 'Today', status: 'Pending Review', fine: '₹850' },
    { id: '2', bookTitle: 'History of India', barcode: 'LIB-2026-0122', member: 'Anita Desai', type: 'Damaged (Water)', date: 'Yesterday', status: 'Pending Review', fine: 'Pending Assessment' },
    { id: '3', bookTitle: 'Introduction to Algorithms', barcode: 'LIB-2026-0982', member: 'Priya Singh', type: 'Damaged (Torn pages)', date: 'Last Week', status: 'Fine Assessed', fine: '₹300' },
    { id: '4', bookTitle: 'The Great Gatsby', barcode: 'LIB-2026-0044', member: 'Aarav Patel', type: 'Lost', date: '2 Weeks Ago', status: 'Resolved', fine: 'Paid' },
  ];

  const filteredIncidents = incidents.filter(i => 
    activeTab === 'all' || 
    (activeTab === 'pending' && (i.status === 'Pending Review' || i.status === 'Fine Assessed')) ||
    (activeTab === 'resolved' && i.status === 'Resolved')
  );

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col bg-gray-50/50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertIcon className="text-rose-600" /> Lost & Damaged Books
          </h1>
          <p className="text-sm text-gray-500">Track missing assets, evaluate damage, and assess replacement fines</p>
        </div>
        <button className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold shadow hover:bg-rose-700">
          + Report Incident
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-rose-500 to-red-600 p-5 rounded-xl text-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <AlertIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-rose-100">Pending Resolutions</p>
            <p className="text-3xl font-bold">12</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <GavelIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Fine Payment</p>
            <p className="text-2xl font-bold text-gray-900">5 <span className="text-sm font-normal text-amber-600">due</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircleIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Resolved (This Month)</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`text-sm font-bold ${activeTab === 'pending' ? 'text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Active Incidents
            </button>
            <button 
              onClick={() => setActiveTab('resolved')}
              className={`text-sm font-bold ${activeTab === 'resolved' ? 'text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Resolved Cases
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              className={`text-sm font-bold ${activeTab === 'all' ? 'text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Records
            </button>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search barcode or member..." 
              className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm w-64 bg-white shadow-sm focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 border-b border-gray-200 shadow-sm z-10">
              <tr>
                <th className="px-6 py-4">Book Details</th>
                <th className="px-6 py-4">Reported By / Member</th>
                <th className="px-6 py-4">Issue Type</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Fine / Recovery</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{incident.bookTitle}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">{incident.barcode}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{incident.member}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${incident.type.includes('Lost') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {incident.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${incident.status === 'Resolved' ? 'bg-emerald-500' : incident.status === 'Fine Assessed' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}></span>
                      <span className="text-gray-700 font-medium">{incident.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${incident.fine === 'Paid' ? 'text-emerald-600' : incident.fine.startsWith('₹') ? 'text-amber-600' : 'text-gray-400'}`}>
                      {incident.fine}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {incident.status === 'Pending Review' && (
                      <button className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-xs font-bold shadow-sm">
                        Assess Fine
                      </button>
                    )}
                    {incident.status === 'Fine Assessed' && (
                      <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-xs font-bold shadow-sm flex items-center justify-center gap-1 inline-flex">
                        <MoneyIcon sx={{ fontSize: 14 }} /> Mark Paid
                      </button>
                    )}
                    <button className="px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-xs font-bold shadow-sm">
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
              {filteredIncidents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No lost or damaged records found for this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LostDamagedManagement;
