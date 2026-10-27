import React, { useState } from 'react';
import { 
  Cake as CakeIcon, 
  Celebration as CelebrationIcon, 
  Send as SendIcon
} from '@mui/icons-material';

const BirthdayAnniversaryDashboard: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const events = [
    { id: '1', name: 'Aarav Patel', type: 'Birthday', role: 'Student (10-A)', date: 'Today', status: 'Pending Greeting' },
    { id: '2', name: 'Sneha Reddy', type: 'Birthday', role: 'Student (8-B)', date: 'Tomorrow', status: 'Upcoming' },
    { id: '3', name: 'Anita Desai', type: 'Work Anniversary (5 Yrs)', role: 'Senior Teacher', date: 'Today', status: 'Greeting Sent' },
    { id: '4', name: 'Rahul Kumar', type: 'Birthday', role: 'Staff (Admin)', date: 'In 2 Days', status: 'Upcoming' },
  ];

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col bg-gray-50/50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CelebrationIcon className="text-pink-500" /> Celebrations & Greetings
          </h1>
          <p className="text-sm text-gray-500">Track upcoming birthdays and work anniversaries across the campus</p>
        </div>
        <button className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold shadow hover:bg-pink-700 flex items-center gap-2">
          <SendIcon fontSize="small" /> Bulk Send Greetings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-5 rounded-xl text-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <CakeIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-pink-100">Today's Birthdays</p>
            <p className="text-3xl font-bold">12</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-5 rounded-xl text-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <CelebrationIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-purple-100">Work Anniversaries</p>
            <p className="text-3xl font-bold">3</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Auto-Greetings</p>
            <p className="text-lg font-bold text-emerald-600">Active</p>
          </div>
          <button className="px-4 py-2 text-sm font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
            Configure
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Upcoming Events (Next 7 Days)</h2>
          <div className="flex gap-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Events</option>
              <option value="students">Students Only</option>
              <option value="staff">Staff Only</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          {events.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 rounded-full ${event.type.includes('Birthday') ? 'bg-pink-100' : 'bg-purple-100'}`} />
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{event.name}</h3>
                  <p className="text-sm text-gray-500">{event.role}</p>
                </div>
                {event.type.includes('Birthday') ? (
                  <CakeIcon className="text-pink-500" />
                ) : (
                  <CelebrationIcon className="text-purple-500" />
                )}
              </div>
              
              <div className="mt-2 relative z-10">
                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full mr-2">
                  {event.date}
                </span>
                <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                  event.status === 'Greeting Sent' ? 'bg-green-100 text-green-700' :
                  event.status === 'Pending Greeting' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {event.status}
                </span>
              </div>

              <div className="mt-2 pt-3 border-t border-gray-100 flex gap-2 relative z-10">
                <button className="flex-1 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-bold flex items-center justify-center gap-1">
                  <SendIcon sx={{ fontSize: 14 }} /> Send SMS
                </button>
                <button className="flex-1 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-xs font-bold">
                  View Card
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BirthdayAnniversaryDashboard;
