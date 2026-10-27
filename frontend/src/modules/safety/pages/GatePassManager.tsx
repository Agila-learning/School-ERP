import React, { useState } from 'react';
import {
  Badge as IDIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Print as PrintIcon,
  QrCode2 as QRIcon,
} from '@mui/icons-material';

type PassType = 'VISITOR' | 'STUDENT_EARLY' | 'STAFF_OUT';
type PassStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING';

interface GatePass {
  id: string;
  name: string;
  type: PassType;
  purpose: string;
  issuedAt: string;
  validUntil: string;
  status: PassStatus;
  authorizedBy: string;
  hostName?: string;
  photoUrl?: string;
}

const INITIAL_PASSES: GatePass[] = [];

const GatePassManager: React.FC = () => {
  const [passes, setPasses] = useState<GatePass[]>(INITIAL_PASSES);
  const [selectedPass, setSelectedPass] = useState<GatePass | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? passes : passes.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-800 to-gray-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-20 -translate-y-20 blur-2xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <IDIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">Gate Pass Manager</h1>
            <p className="text-gray-400 text-sm mt-1">Issue and track visitor passes and early leave authorizations.</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-3">
          <button className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-100 transition-colors">
            <IDIcon style={{ fontSize: 18 }} /> Issue New Pass
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pass List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            {(['all', 'ACTIVE', 'PENDING', 'EXPIRED'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                {f === 'all' ? 'All Passes' : f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
                <IDIcon style={{ fontSize: 40 }} className="text-gray-400 mb-2 mx-auto" />
                <p className="font-bold text-gray-700">No Gate Passes Recorded</p>
                <p className="text-sm text-gray-500 mt-1">There are no passes matching the selected filter. Click "Issue New Pass" to generate an entry permit.</p>
              </div>
            ) : (
              filtered.map(pass => (
              <div 
                key={pass.id} 
                onClick={() => setSelectedPass(pass)}
                className={`bg-white p-5 rounded-2xl border cursor-pointer transition-all ${selectedPass?.id === pass.id ? 'border-gray-900 shadow-md ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    pass.type === 'VISITOR' ? 'bg-blue-100 text-blue-700' : 
                    pass.type === 'STUDENT_EARLY' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {pass.type.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    pass.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 
                    pass.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {pass.status}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg">{pass.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{pass.purpose}</p>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs text-gray-400 font-mono">
                  <span>ID: {pass.id}</span>
                  <span>{pass.issuedAt}</span>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Pass Preview / Action Desk */}
        <div className="lg:col-span-1">
          {selectedPass ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden sticky top-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col items-center border-b border-gray-200 border-dashed">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mb-4">
                  <QRIcon style={{ fontSize: 64 }} className="text-gray-900" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">{selectedPass.name}</h2>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{selectedPass.type.replace('_', ' ')} PASS</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pass ID</p>
                    <p className="font-mono font-bold text-gray-900">{selectedPass.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                    <p className={`font-bold ${selectedPass.status === 'ACTIVE' ? 'text-emerald-600' : selectedPass.status === 'PENDING' ? 'text-orange-600' : 'text-gray-500'}`}>
                      {selectedPass.status}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Purpose</p>
                    <p className="font-semibold text-gray-800">{selectedPass.purpose}</p>
                  </div>
                  {selectedPass.hostName && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Meeting With</p>
                      <p className="font-semibold text-gray-800">{selectedPass.hostName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issued At</p>
                    <p className="font-semibold text-gray-800">{selectedPass.issuedAt}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valid Until</p>
                    <p className="font-semibold text-gray-800">{selectedPass.validUntil}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                {selectedPass.status === 'PENDING' ? (
                  <>
                    <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1">
                      <ApproveIcon style={{ fontSize: 18 }} /> Approve
                    </button>
                    <button className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1">
                      <RejectIcon style={{ fontSize: 18 }} /> Reject
                    </button>
                  </>
                ) : (
                  <button className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    <PrintIcon style={{ fontSize: 18 }} /> Print Pass
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-300 text-center text-gray-500">
              <p className="font-bold text-gray-700">No Pass Selected</p>
              <p className="text-xs text-gray-400 mt-1">Select a gate pass from the list to preview QR and credentials.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GatePassManager;
