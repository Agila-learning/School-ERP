import React, { useState } from 'react';
import { 
  MenuBook as MenuBookIcon, 
  RecordVoiceOver as SpeakerIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const PrayerAssemblyManager: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const assemblies = [
    { id: '1', date: 'Today', theme: 'Honesty & Integrity', classInCharge: '10-A', speaker: 'Rahul Sharma', status: 'Scheduled' },
    { id: '2', date: 'Tomorrow', theme: 'Environmental Awareness', classInCharge: '9-B', speaker: 'Sneha Gupta', status: 'Draft' },
    { id: '3', date: 'Next Monday', theme: 'National Pride', classInCharge: '12-Science', speaker: 'Principal Dr. Mehta', status: 'Confirmed' },
  ];

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col bg-gray-50/50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MenuBookIcon className="text-teal-600" /> Morning Prayer & Assembly
          </h1>
          <p className="text-sm text-gray-500">Plan and schedule daily school assemblies, themes, and duties</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow hover:bg-teal-700">
          + Schedule Assembly
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Upcoming Assemblies</h2>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white shadow-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {assemblies.map((assembly) => (
              <div key={assembly.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex flex-col items-center justify-center border border-teal-100">
                      <span className="text-xs font-bold uppercase">{assembly.date.split(' ')[0]}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Theme: {assembly.theme}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <PeopleIcon sx={{ fontSize: 16 }} /> Class in Charge: <span className="font-semibold text-gray-700">{assembly.classInCharge}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    assembly.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    assembly.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {assembly.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">Main Speaker</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1 mt-1">
                      <SpeakerIcon sx={{ fontSize: 16, color: '#4F46E5' }} /> {assembly.speaker}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">Pledge Leader</p>
                    <p className="font-medium text-gray-900 mt-1">Class Prefect</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">News Reading</p>
                    <p className="font-medium text-gray-900 mt-1">Selected Student</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 justify-end">
                  <button className="px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-xs font-bold">Edit Details</button>
                  <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-bold">Print Order</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900">Standard Sequence</h2>
            <p className="text-xs text-gray-500 mt-1">Default order of events for morning assembly</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
              {[
                { time: '08:00 AM', event: 'Assembly Bell & Line-up' },
                { time: '08:05 AM', event: 'School Prayer' },
                { time: '08:08 AM', event: 'National Pledge' },
                { time: '08:10 AM', event: 'Thought for the Day' },
                { time: '08:12 AM', event: 'News Reading' },
                { time: '08:15 AM', event: 'Principal\'s Address / Special Topic' },
                { time: '08:20 AM', event: 'National Anthem' },
                { time: '08:22 AM', event: 'Dispersal to Classes' },
              ].map((item, index) => (
                <div key={index} className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-[7px] top-1.5 border-2 border-white shadow-sm" />
                  <p className="text-xs font-bold text-teal-600">{item.time}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.event}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50">
             <button className="w-full py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-bold shadow-sm">
              Customize Sequence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerAssemblyManager;
