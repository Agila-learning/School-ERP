import React, { useEffect, useState } from 'react';
import api from '../../../../core/api/axios';
import PeopleIcon from '@mui/icons-material/People';

const CoordinatorStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/staff-portal/coordinator/students');
        setStudents(response.data.data || []);
      } catch (error) {
        console.error('Error fetching students', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <PeopleIcon className="text-indigo-600" fontSize="large" />
        <h1 className="text-2xl font-bold text-gray-800">My Class Students</h1>
      </div>
      
      {loading ? (
        <p className="text-gray-500">Loading students...</p>
      ) : students.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">No students found. You might not have any active class coordinator assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, index) => (
            <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                {student.firstName?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{student.firstName} {student.lastName}</h3>
                <p className="text-xs text-gray-500">Admission No: {student.admissionNumber}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoordinatorStudents;
