import React, { useState } from 'react';
import {
  Assignment as ExamIcon,
  Search as SearchIcon,
  Add as AddIcon,
  PlayCircleFilled as StartIcon,
  CheckCircle as CompleteIcon,
  Warning as AlertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as PeopleIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

interface ExamItem {
  id: string;
  name: string;
  grade: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  students: number;
  room: string;
}

const INITIAL_EXAMS: ExamItem[] = [];

const ExamManager: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>(INITIAL_EXAMS);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-700';
      case 'Ongoing': return 'bg-orange-100 text-orange-700 animate-pulse';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Upcoming': return <TimeIcon style={{ fontSize: 14 }} />;
      case 'Ongoing': return <StartIcon style={{ fontSize: 14 }} />;
      case 'Completed': return <CompleteIcon style={{ fontSize: 14 }} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-2xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/10 rounded-full translate-y-10 blur-2xl" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <ExamIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">Supervisor Desk</h1>
            <p className="text-purple-100 text-sm mt-1">Manage schedules, track live ongoing exams, and dispatch invigilators.</p>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-3">
          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2.5 rounded-xl font-bold text-sm border border-white/30 transition-colors">
            <AlertIcon style={{ fontSize: 18 }} /> Issue Alert
          </button>
          <button className="flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition-colors">
            <AddIcon style={{ fontSize: 18 }} /> Schedule Exam
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex gap-4">
            <h2 className="font-bold text-gray-800 text-lg">Examination Schedules</h2>
            <div className="flex gap-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">All Exams</span>
              <span className="bg-white text-gray-500 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold flex items-center hover:bg-gray-50 cursor-pointer">Live Now</span>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
            <input 
              type="text" 
              placeholder="Search subject or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
            />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams
            .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.id.toLowerCase().includes(searchTerm.toLowerCase()))
            .length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
              <ExamIcon style={{ fontSize: 48 }} className="text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-700 text-lg">No Examination Schedules Found</p>
              <p className="text-sm text-gray-400 mt-1">There are no exams matching your search criteria. Click "Schedule Exam" to create new test timetable.</p>
            </div>
          ) : (
            exams
              .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.id.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(exam => (
            <div key={exam.id} className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-100 transition-all relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">{exam.id}</span>
                    <h3 className="font-bold text-gray-900 mt-2">{exam.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Grade: {exam.grade}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${getStatusColor(exam.status)}`}>
                    {getStatusIcon(exam.status)} {exam.status}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5"><TimeIcon style={{ fontSize: 16 }} /> Schedule</span>
                    <span className="font-semibold text-gray-700">{exam.date} • {exam.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5"><PeopleIcon style={{ fontSize: 16 }} /> Capacity</span>
                    <span className="font-semibold text-gray-700">{exam.students} Students in {exam.room}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 mt-auto">
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <EditIcon style={{ fontSize: 18 }} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <DeleteIcon style={{ fontSize: 18 }} />
                </button>
                {exam.status === 'Ongoing' && (
                  <button className="ml-auto flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                    Manage Live <StartIcon style={{ fontSize: 14 }} />
                  </button>
                )}
              </div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
};

export default ExamManager;
