import React, { useState } from 'react';
import {
  ReportProblem as ComplaintIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as ResolvedIcon,
  SupportAgent as AgentIcon,
  AssignmentTurnedIn as InvestigateIcon,
  Warning as HighPriorityIcon,
} from '@mui/icons-material';

interface ComplaintTicket {
  id: string;
  category: string;
  subject: string;
  reporter: string;
  date: string;
  priority: string;
  status: string;
  assignee: string;
}

const INITIAL_COMPLAINTS: ComplaintTicket[] = [];

const ComplaintsManager: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintTicket[]>(INITIAL_COMPLAINTS);
  const [searchTerm, setSearchTerm] = useState('');

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Investigating': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'Resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-rose-500 to-red-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-2xl" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <ComplaintIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">Grievance & Complaints</h1>
            <p className="text-rose-100 text-sm mt-1">Track, assign, and resolve issues raised by parents, students, and staff.</p>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-3">
          <button className="flex items-center gap-2 bg-white text-rose-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-rose-50 transition-colors">
            <FilterIcon style={{ fontSize: 18 }} /> Filter Tickets
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h2 className="font-bold text-gray-800 text-lg">Active Tickets</h2>
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
            <input 
              type="text" 
              placeholder="Search by ID or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Ticket Info</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Reporter</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Priority & Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complaints
                .filter(c => c.subject.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))
                .length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    <ComplaintIcon style={{ fontSize: 36 }} className="mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-gray-600">No grievance tickets recorded</p>
                    <p className="text-xs text-gray-400 mt-0.5">Tickets filed by parents, students, or staff will appear here.</p>
                  </td>
                </tr>
              ) : (
                complaints
                  .filter(c => c.subject.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {ticket.priority === 'Critical' ? (
                          <HighPriorityIcon className="text-red-500" style={{ fontSize: 20 }} />
                        ) : (
                          <ComplaintIcon className="text-gray-400" style={{ fontSize: 20 }} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{ticket.id} • {ticket.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800 text-sm">{ticket.reporter}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ticket.date}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority} Priority
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {ticket.status === 'Open' && (
                        <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-indigo-700 hover:border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                          <AgentIcon style={{ fontSize: 14 }} /> Assign
                        </button>
                      )}
                      
                      {ticket.status === 'Investigating' && (
                        <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                          <InvestigateIcon style={{ fontSize: 14 }} /> Update
                        </button>
                      )}
                      
                      {ticket.status !== 'Resolved' ? (
                        <button className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                          <ResolvedIcon style={{ fontSize: 14 }} /> Resolve
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                          <ResolvedIcon style={{ fontSize: 16 }} /> Closed
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Assigned: {ticket.assignee}</p>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsManager;
