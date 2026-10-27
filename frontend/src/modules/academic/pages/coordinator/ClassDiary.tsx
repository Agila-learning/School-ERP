import React, { useEffect, useState } from 'react';
import api from '../../../../core/api/axios';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const ClassDiary = () => {
  const [diaries, setDiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const response = await api.get('/staff-portal/coordinator/diary');
        setDiaries(response.data.data || []);
      } catch (error) {
        console.error('Error fetching diaries', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiaries();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MenuBookIcon className="text-blue-600" fontSize="large" />
          <h1 className="text-2xl font-bold text-gray-800">Class Diary</h1>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          + New Entry
        </button>
      </div>
      
      {loading ? (
        <p className="text-gray-500">Loading diary entries...</p>
      ) : diaries.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">No diary entries found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {diaries.map((diary, index) => (
            <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-800 text-lg">{diary.title}</h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {new Date(diary.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{diary.description}</p>
              
              {(diary.homework || diary.activities) && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {diary.homework && (
                    <div>
                      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-1">Homework</h4>
                      <p className="text-sm text-gray-600">{diary.homework}</p>
                    </div>
                  )}
                  {diary.activities && (
                    <div>
                      <h4 className="text-xs font-bold text-emerald-600 uppercase mb-1">Activities</h4>
                      <p className="text-sm text-gray-600">{diary.activities}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassDiary;
