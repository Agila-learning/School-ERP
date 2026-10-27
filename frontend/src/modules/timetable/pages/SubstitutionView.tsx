import React, { useEffect, useState } from 'react';
import api from '../../../core/api/axios';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

const SubstitutionView = () => {
  const [substitutions, setSubstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from /timetable/substitutions
    // For now, we simulate an empty state since the API isn't fully wired yet
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <SyncAltIcon className="text-blue-600" fontSize="large" />
        <h1 className="text-2xl font-bold text-gray-800">My Substitutions</h1>
      </div>
      
      {loading ? (
        <p className="text-gray-500">Loading substitution data...</p>
      ) : substitutions.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">You have no substitution classes assigned for today.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {substitutions.map((sub, index) => (
            <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800">Period {sub.periodId?.name}</h3>
              <p className="text-sm text-gray-600 mt-2">Class: {sub.classId?.name} {sub.sectionId?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubstitutionView;
