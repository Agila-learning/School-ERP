import React, { useState } from 'react';

type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'BLOCKED';

interface Bed {
  id: string; number: string; status: BedStatus; studentName?: string; studentRoll?: string;
}
interface Room {
  id: string; number: string; type: string; capacity: number; floor: string; beds: Bed[];
  status: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE' | 'BLOCKED';
}

const bedColors: Record<BedStatus, string> = {
  AVAILABLE: 'bg-green-100 border-green-300 text-green-700',
  OCCUPIED: 'bg-indigo-100 border-indigo-300 text-indigo-700',
  RESERVED: 'bg-blue-100 border-blue-300 text-blue-700',
  MAINTENANCE: 'bg-amber-100 border-amber-300 text-amber-700',
  BLOCKED: 'bg-gray-100 border-gray-300 text-gray-500',
};

const roomStatusColor: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  PARTIALLY_OCCUPIED: 'bg-blue-100 text-blue-700',
  FULL: 'bg-indigo-100 text-indigo-700',
  MAINTENANCE: 'bg-amber-100 text-amber-700',
  BLOCKED: 'bg-gray-100 text-gray-500',
};

const HostelRoomManagement: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const floors = ['ALL', 'Ground Floor', 'First Floor', 'Second Floor'];

  const rooms: Room[] = [
    {
      id: '1', number: '101', type: 'DOUBLE', capacity: 2, floor: 'Ground Floor', status: 'FULL',
      beds: [
        { id: 'b1', number: 'A', status: 'OCCUPIED', studentName: 'Arjun Kumar', studentRoll: 'STD-001' },
        { id: 'b2', number: 'B', status: 'OCCUPIED', studentName: 'Ravi M.', studentRoll: 'STD-007' },
      ]
    },
    {
      id: '2', number: '102', type: 'DOUBLE', capacity: 2, floor: 'Ground Floor', status: 'PARTIALLY_OCCUPIED',
      beds: [
        { id: 'b3', number: 'A', status: 'OCCUPIED', studentName: 'Priya S.', studentRoll: 'STD-003' },
        { id: 'b4', number: 'B', status: 'AVAILABLE' },
      ]
    },
    {
      id: '3', number: '103', type: 'SINGLE', capacity: 1, floor: 'Ground Floor', status: 'AVAILABLE',
      beds: [{ id: 'b5', number: 'A', status: 'AVAILABLE' }]
    },
    {
      id: '4', number: '201', type: 'TRIPLE', capacity: 3, floor: 'First Floor', status: 'PARTIALLY_OCCUPIED',
      beds: [
        { id: 'b6', number: 'A', status: 'OCCUPIED', studentName: 'Kavya R.', studentRoll: 'STD-009' },
        { id: 'b7', number: 'B', status: 'RESERVED' },
        { id: 'b8', number: 'C', status: 'AVAILABLE' },
      ]
    },
    {
      id: '5', number: '202', type: 'DOUBLE', capacity: 2, floor: 'First Floor', status: 'MAINTENANCE',
      beds: [
        { id: 'b9', number: 'A', status: 'MAINTENANCE' },
        { id: 'b10', number: 'B', status: 'MAINTENANCE' },
      ]
    },
  ];

  const filtered = rooms.filter(r => {
    const matchFloor = selectedFloor === 'ALL' || r.floor === selectedFloor;
    const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    return matchFloor && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room & Bed Management</h1>
          <p className="text-sm text-gray-500">View and manage room allocations across all buildings</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Room
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(bedColors).map(([status, cls]) => (
          <span key={status} className={`px-2.5 py-1 rounded-full border ${cls} font-medium`}>{status.replace('_', ' ')}</span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={selectedFloor} onChange={e => setSelectedFloor(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          {floors.map(f => <option key={f}>{f}</option>)}
        </select>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="PARTIALLY_OCCUPIED">Partially Occupied</option>
          <option value="FULL">Full</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Room Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(room => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`bg-white rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all p-5 ${selectedRoom?.id === room.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Room {room.number}</h3>
                  <p className="text-xs text-gray-400">{room.floor} · {room.type.replace('_', ' ')}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roomStatusColor[room.status]}`}>
                  {room.status.replace('_', ' ')}
                </span>
              </div>

              {/* Bed Grid */}
              <div className="flex gap-2 flex-wrap">
                {room.beds.map(bed => (
                  <div
                    key={bed.id}
                    className={`flex-1 min-w-12 border-2 rounded-xl px-3 py-2.5 text-center ${bedColors[bed.status]}`}
                    title={bed.studentName || bed.status}
                  >
                    <p className="font-bold text-sm">{bed.number}</p>
                    {bed.studentName ? (
                      <p className="text-xs truncate mt-0.5 opacity-80">{bed.studentName.split(' ')[0]}</p>
                    ) : (
                      <p className="text-xs mt-0.5 opacity-60">{bed.status === 'AVAILABLE' ? 'Free' : bed.status.slice(0, 4)}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-400">
                {room.beds.filter(b => b.status === 'OCCUPIED').length}/{room.capacity} occupied
              </div>
            </div>
          ))}
        </div>

        {/* Room Detail Panel */}
        {selectedRoom && (
          <div className="w-72 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
              <h3 className="font-semibold text-indigo-900">Room {selectedRoom.number}</h3>
              <p className="text-xs text-indigo-600">{selectedRoom.floor} · {selectedRoom.type}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {selectedRoom.beds.map(bed => (
                <div key={bed.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900">Bed {bed.number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${bedColors[bed.status]}`}>{bed.status}</span>
                  </div>
                  {bed.studentName && (
                    <div>
                      <p className="text-sm text-gray-800">{bed.studentName}</p>
                      <p className="text-xs text-gray-400">{bed.studentRoll}</p>
                    </div>
                  )}
                  {bed.status === 'AVAILABLE' && (
                    <button className="mt-2 w-full py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium">
                      Allocate Bed
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button className="flex-1 py-2 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">Inspect</button>
              <button className="flex-1 py-2 text-xs bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100">Maintenance</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelRoomManagement;
