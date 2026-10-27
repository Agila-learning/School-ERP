import React, { useEffect, useState } from 'react';
import api from '../../../../core/api/axios';
import CampaignIcon from '@mui/icons-material/Campaign';

const CoordinatorAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/staff-portal/coordinator/announcements');
        setAnnouncements(response.data.data || []);
      } catch (error) {
        console.error('Error fetching announcements', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <CampaignIcon className="text-amber-500" fontSize="large" />
        <h1 className="text-2xl font-bold text-gray-800">Class Announcements</h1>
      </div>
      
      {loading ? (
        <p className="text-gray-500">Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">No announcements posted for your class yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann, index) => (
            <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800">{ann.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{ann.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoordinatorAnnouncements;
