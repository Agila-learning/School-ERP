import React, { useEffect, useState } from 'react';
import api from '../../../../core/api/axios';
import AssessmentIcon from '@mui/icons-material/Assessment';

const CoordinatorPerformance = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await api.get('/staff-portal/coordinator/performance');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching performance', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <AssessmentIcon className="text-emerald-600" fontSize="large" />
        <h1 className="text-2xl font-bold text-gray-800">Class Performance Overview</h1>
      </div>
      
      {loading ? (
        <p className="text-gray-500">Loading performance data...</p>
      ) : !stats ? (
        <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">No performance data available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-2">Average Attendance</h3>
            <p className="text-4xl font-black text-emerald-600">{stats.averageAttendance || 'N/A'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-4 text-center">Top Performing Subjects</h3>
            <ul className="space-y-2">
              {stats.topSubjects?.map((sub: string, i: number) => (
                <li key={i} className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-bold text-center">
                  {sub}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-4 text-center">Requires Attention</h3>
            <ul className="space-y-2">
              {stats.weakSubjects?.map((sub: string, i: number) => (
                <li key={i} className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-bold text-center">
                  {sub}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorPerformance;
